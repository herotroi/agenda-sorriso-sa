import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache do token OAuth (válido por 1 hora)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getOAuthToken(): Promise<string> {
  const now = Date.now();
  
  // Retorna token em cache se ainda válido
  if (cachedToken && cachedToken.expiresAt > now) {
    console.log('Using cached OAuth token');
    return cachedToken.token;
  }

  const clientId = Deno.env.get('ICD_API_CLIENT_ID');
  const clientSecret = Deno.env.get('ICD_API_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('ICD API credentials not configured');
  }

  console.log('Fetching new OAuth token from WHO API');

  const tokenResponse = await fetch('https://icdaccessmanagement.who.int/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'icdapi_access',
      grant_type: 'client_credentials',
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('OAuth token error:', errorText);
    throw new Error('Failed to get OAuth token');
  }

  const tokenData = await tokenResponse.json();
  const token = tokenData.access_token;
  const expiresIn = tokenData.expires_in || 3600; // Default 1 hora

  // Cache o token (expira 5 minutos antes para segurança)
  cachedToken = {
    token,
    expiresAt: now + (expiresIn - 300) * 1000,
  };

  console.log('OAuth token cached successfully');
  return token;
}

async function collectICD10Children(obj: any, acc: any[] = []): Promise<any[]> {
  if (!obj || typeof obj !== 'object') return acc;
  const keys = Object.keys(obj);
  // If node looks like an entity with code/title add it
  const code = obj.theCode || obj.code;
  const title = obj.title || obj.longTitle || obj.label;
  if (code && title) acc.push({ code: String(code), title: String(title) });
  
  for (const k of keys) {
    const v = obj[k];
    if (Array.isArray(v)) {
      for (const child of v) await collectICD10Children(child, acc);
    } else if (v && typeof v === 'object') {
      await collectICD10Children(v, acc);
    }
  }
  return acc;
}

async function searchICD10ByCodePrefix(query: string, language: string): Promise<any[]> {
  const token = await getOAuthToken();
  const Q = query.toUpperCase().replace(/[^A-Z0-9.]/g, '');
  const releaseCandidates = ['2019', '2016'];
  const codeCandidates = [Q, Q.slice(0, 4), Q.slice(0, 3), Q.slice(0, 2)].filter(Boolean);

  let payload: any | null = null;
  for (const rel of releaseCandidates) {
    for (const c of codeCandidates) {
      const url = `https://id.who.int/icd/release/10/${rel}/${encodeURIComponent(c)}`;
      const resp = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'API-Version': 'v2',
          'Accept-Language': language,
        },
      });
      if (resp.ok) {
        payload = await resp.json();
        // Stop at first success
        break;
      }
    }
    if (payload) break;
  }

  if (!payload) return [];

  const nodes = await collectICD10Children(payload, []);
  const q = Q;
  const filtered = nodes
    .filter(n => /^[A-Z][0-9A-Z.]*$/.test(n.code))
    .filter(n => n.code.startsWith(q))
    .map(n => ({ code: n.code.toUpperCase(), title: n.title }));

  // Deduplicate by code
  const unique = new Map<string, any>();
  for (const it of filtered) if (!unique.has(it.code)) unique.set(it.code, it);
  const results = Array.from(unique.values());

  results.sort((a, b) => {
    const au = a.code.toUpperCase();
    const bu = b.code.toUpperCase();
    if (au === q && bu !== q) return -1;
    if (bu === q && au !== q) return 1;
    if (au.startsWith(q) && !bu.startsWith(q)) return -1;
    if (bu.startsWith(q) && !au.startsWith(q)) return 1;
    // Ordenar por tamanho desc e código desc para aproximar a lista do exemplo (A069, A068, ...)
    if (au.length !== bu.length) return bu.length - au.length;
    return bu.localeCompare(au);
  });

  return results.slice(0, 20).map(r => ({ ...r, version: 'CID-10' }));
}

async function searchICD(query: string, version: string, language: string = 'pt'): Promise<any[]> {
  // CID-10: não há endpoint de busca; implementamos busca por prefixo de código
  const isCodeQuery = /^[A-Z0-9.]+$/i.test(query);
  if (version === '10') {
    if (!isCodeQuery) return [];
    const results = await searchICD10ByCodePrefix(query.trim(), language);
    return results;
  }

  const token = await getOAuthToken();

  // CID-11 (com busca oficial)
  const releaseId = '2024-01';
  const versionPath = 'icd/release/11';
  
  // Construir URL de busca com query parameters
  const baseUrl = `https://id.who.int/${versionPath}/${releaseId}/mms/search`;
  const searchParams = new URLSearchParams({
    q: query,
    useFlexisearch: 'true',
    flatResults: 'true',
  });
  const searchUrl = `${baseUrl}?${searchParams.toString()}`;
  
  console.log(`Searching ICD-11 for query: "${query}"`);
  console.log(`Search URL: ${searchUrl}`);

  const searchResponse = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'API-Version': 'v2',
      'Accept-Language': language,
    },
  });

  if (!searchResponse.ok) {
    const errorText = await searchResponse.text();
    console.error('ICD search error:', errorText);
    throw new Error(`Failed to search ICD-11`);
  }

  const searchData = await searchResponse.json();
  
  // Formatar resultados
  let results = (searchData.destinationEntities || []).map((entity: any) => {
    // Preferir o código retornado pela API (theCode)
    const rawCode: string | undefined = entity.theCode;

    // Remover tags HTML do título (a API destaca o termo com <em>)
    const title = String(entity.title || 'Sem título')
      .replace(/<em class='found'>/g, '')
      .replace(/<\/em>/g, '');

    // Se não houver theCode, tentar extrair do id, mas apenas se for um formato simples
    let fallbackCode = '';
    if (!rawCode && entity.id) {
      const match = String(entity.id).match(/\/([A-Z0-9.]+)$/);
      fallbackCode = match ? match[1] : '';
    }

    // Escolher o código final e validar para aceitar apenas formatos simples (sem espaços, & etc.)
    const code = String(rawCode || fallbackCode).toUpperCase();
    const isValidCode = /^[A-Z0-9.]+$/.test(code);

    return {
      code,
      title,
      version: `CID-11`,
      id: entity.id,
      score: entity.score || 0,
      __valid: Boolean(code) && isValidCode,
    } as any;
  })
  // Manter apenas resultados com código válido
  .filter((r: any) => r.__valid);

  // Se a query parece ser um código (ex.: "6A", "A00.0"), filtrar para começar com a query
  const isCodeSearch = /^[A-Z0-9.]+$/i.test(query);
  if (isCodeSearch && query.length >= 2) {
    const q = query.toUpperCase();
    const startsWithMatches = results.filter((r: any) => r.code.startsWith(q));

    if (startsWithMatches.length > 0) {
      results = startsWithMatches;
    } else {
      // Se não houver início exato, tentar códigos que contenham a query
      const containsMatches = results.filter((r: any) => r.code.includes(q));
      if (containsMatches.length > 0) {
        results = containsMatches;
      } else {
        // Nenhum código combina: preferimos retornar vazio para evitar ruído
        results = [];
      }
    }

    // Ordenar: igualdade perfeita primeiro, depois começa com + menor código
    results.sort((a: any, b: any) => {
      const au = a.code.toUpperCase();
      const bu = b.code.toUpperCase();
      if (au === q && bu !== q) return -1;
      if (bu === q && au !== q) return 1;
      if (au.startsWith(q) && !bu.startsWith(q)) return -1;
      if (bu.startsWith(q) && !au.startsWith(q)) return 1;
      // Menor tamanho e ordem lexicográfica como desempate
      if (au.length !== bu.length) return au.length - bu.length;
      return au.localeCompare(bu);
    });
  } else {
    // Busca por texto: ordenar por score desc e então título
    results.sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0) || String(a.title).localeCompare(String(b.title)));
  }

  // Limitar para não poluir o dropdown
  results = results.slice(0, 20);

  console.log(`Found ${results.length} results for ICD-11`);
  return results;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, version = '11', language = 'pt' } = await req.json();

    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Query deve ter pelo menos 2 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['10', '11'].includes(version)) {
      return new Response(
        JSON.stringify({ error: 'Version deve ser "10" ou "11"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = await searchICD(query.trim(), version, language);

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-icd function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        results: []
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

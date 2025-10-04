import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Normalização para português brasileiro (remove acentos)
function normalizePTBR(str: string): string {
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Aliases comuns em português para termos médicos
const ALIASES_PT: Record<string, string> = {
  'tdah': 'transtorno do déficit de atenção e hiperatividade',
  'avc': 'acidente vascular cerebral',
  'iam': 'infarto agudo do miocárdio',
  'has': 'hipertensão arterial sistêmica',
  'dpoc': 'doença pulmonar obstrutiva crônica',
  'toc': 'transtorno obsessivo compulsivo',
  'tept': 'transtorno de estresse pós-traumático',
};

// Cache do token OAuth (válido por 1 hora)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getOAuthToken(): Promise<string> {
  const now = Date.now();
  
  // Retorna token em cache se ainda válido
  if (cachedToken && cachedToken.expiresAt > now) {
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

async function searchICD10(query: string, language: string): Promise<any[]> {
  const token = await getOAuthToken();
  const normalizedQuery = normalizePTBR(query);
  
  console.log(`CID-10 unified search - query: "${query}"`);

  // Coletar resultados dos capítulos principais
  const chapters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  const releaseCandidates = ['2019', '2016'];
  const allNodes: any[] = [];

  for (const rel of releaseCandidates) {
    for (const chapter of chapters.slice(0, 15)) {
      const url = `https://id.who.int/icd/release/10/${rel}/${chapter}`;
      try {
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
          const chapterData = await resp.json();
          const nodes = await collectICD10Children(chapterData, []);
          allNodes.push(...nodes);
        }
      } catch (e) {
        console.error(`Error fetching chapter ${chapter}:`, e);
      }
      if (allNodes.length > 300) break;
    }
    if (allNodes.length > 0) break;
  }

  // Filtrar comparando tanto código quanto título
  const filtered = allNodes
    .filter(n => /^[A-Z][0-9A-Z.]*$/.test(n.code))
    .filter(n => {
      const normalizedCode = normalizePTBR(n.code);
      const normalizedTitle = normalizePTBR(n.title);
      return normalizedCode.includes(normalizedQuery) || normalizedTitle.includes(normalizedQuery);
    })
    .map(n => ({ code: n.code.toUpperCase(), title: n.title }));

  // Deduplicate
  const unique = new Map<string, any>();
  for (const it of filtered) if (!unique.has(it.code)) unique.set(it.code, it);
  
  const results = Array.from(unique.values());
  
  // Ordenar por relevância
  results.sort((a, b) => {
    const aTitleNorm = normalizePTBR(a.title);
    const bTitleNorm = normalizePTBR(b.title);
    const aCodeNorm = normalizePTBR(a.code);
    const bCodeNorm = normalizePTBR(b.code);
    
    // Código exato primeiro
    const aCodeMatch = aCodeNorm === normalizedQuery;
    const bCodeMatch = bCodeNorm === normalizedQuery;
    if (aCodeMatch && !bCodeMatch) return -1;
    if (bCodeMatch && !aCodeMatch) return 1;
    
    // Código começa com o termo
    const aCodeStarts = aCodeNorm.startsWith(normalizedQuery);
    const bCodeStarts = bCodeNorm.startsWith(normalizedQuery);
    if (aCodeStarts && !bCodeStarts) return -1;
    if (bCodeStarts && !aCodeStarts) return 1;
    
    // Título começa com o termo
    const aTitleStarts = aTitleNorm.startsWith(normalizedQuery);
    const bTitleStarts = bTitleNorm.startsWith(normalizedQuery);
    if (aTitleStarts && !bTitleStarts) return -1;
    if (bTitleStarts && !aTitleStarts) return 1;
    
    return aTitleNorm.localeCompare(bTitleNorm);
  });

  console.log(`CID-10 unified search found ${results.length} results`);
  return results.slice(0, 20).map(r => ({ ...r, version: 'CID-10', id: `cid10:${r.code}` }));
}

async function searchICD11(query: string, language: string): Promise<any[]> {
  const token = await getOAuthToken();

  console.log(`CID-11 unified search - query: "${query}"`);

  // Busca oficial da API do CID-11 com fallback de idiomas
  const releaseId = '2024-01';
  const versionPath = 'icd/release/11';
  const baseUrl = `https://id.who.int/${versionPath}/${releaseId}/mms/search`;

  const tryLangs = Array.from(new Set([
    language,
    language?.toLowerCase().startsWith('pt') ? 'pt' : 'en',
    'en',
  ].filter(Boolean))) as string[];

  let destinationEntities: any[] = [];
  let usedLang = language;

  for (const lang of tryLangs) {
    const searchParams = new URLSearchParams({
      q: query,
      useFlexisearch: 'true',
      flatResults: 'true',
    });
    const searchUrl = `${baseUrl}?${searchParams.toString()}`;

    const resp = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'API-Version': 'v2',
        'Accept-Language': lang,
      },
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(`ICD-11 search error (${lang}):`, errorText);
      continue;
    }

    const data = await resp.json();
    destinationEntities = data.destinationEntities || [];
    if (destinationEntities.length > 0) {
      usedLang = lang;
      break;
    }
  }

  let results = destinationEntities.map((entity: any) => {
    const rawCode: string | undefined = entity.theCode;
    const title = String(entity.title || 'Sem título')
      .replace(/<em class='found'>/g, '')
      .replace(/<\/em>/g, '');

    let fallbackCode = '';
    if (!rawCode && entity.id) {
      const match = String(entity.id).match(/\/([A-Z0-9.]+)$/);
      fallbackCode = match ? match[1] : '';
    }

    const code = String(rawCode || fallbackCode).toUpperCase();
    const isValidCode = /^[A-Z0-9.]+$/.test(code);

    return {
      code,
      title,
      version: `CID-11`,
      id: entity.id,
      score: entity.score || 0,
      lang: usedLang,
      __valid: Boolean(code) && isValidCode,
    } as any;
  }).filter((r: any) => r.__valid);

  // Ordenação: prioriza correspondência de código quando apropriado, depois score
  const isCodeLike = /^[A-Z0-9.]+$/i.test(query.trim());
  const q = query.trim().toUpperCase();
  results.sort((a: any, b: any) => {
    if (isCodeLike) {
      const aEq = a.code === q; const bEq = b.code === q;
      if (aEq && !bEq) return -1; if (bEq && !aEq) return 1;
      const aStarts = a.code.startsWith(q); const bStarts = b.code.startsWith(q);
      if (aStarts && !bStarts) return -1; if (bStarts && !aStarts) return 1;
    }
    if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
    return String(a.title).localeCompare(String(b.title));
  });

  console.log(`CID-11 unified search found ${results.length} results`);
  return results.slice(0, 20);
}

async function searchICD(query: string, version: string, language: string = 'pt-BR'): Promise<any[]> {
  const lang = language && language.toLowerCase().startsWith('pt') ? 'pt-BR' : (language || 'pt-BR');
  const normalizedQuery = normalizePTBR(query);
  
  console.log(`Search ICD unified - version: ${version}, query: "${query}"`);
  
  // Verificar se há alias para expandir o termo
  let expandedQuery: string | null = null;
  const queryKey = normalizedQuery.trim();
  if (ALIASES_PT[queryKey]) {
    expandedQuery = ALIASES_PT[queryKey];
    console.log(`Alias found - expanding "${query}" to "${expandedQuery}"`);
  }
  
  // Busca na versão selecionada
  let results: any[] = [];
  
  if (version === '10') {
    results = await searchICD10(query.trim(), lang);
  } else {
    results = await searchICD11(query.trim(), lang);
  }
  
  console.log(`Initial search (CID-${version}) found ${results.length} results`);
  
  // Se não houver resultados, tentar na outra versão (fallback)
  if (results.length === 0) {
    const otherVersion = version === '10' ? '11' : '10';
    console.log(`No results found, trying fallback to CID-${otherVersion}`);
    
    const fallbackResults = otherVersion === '10' 
      ? await searchICD10(query.trim(), lang)
      : await searchICD11(query.trim(), lang);
    
    if (fallbackResults.length > 0) {
      console.log(`Fallback to CID-${otherVersion} found ${fallbackResults.length} results`);
      results = fallbackResults;
    }
  }
  
  // Se houver termo expandido (alias) e ainda não temos muitos resultados, buscar com termo expandido
  if (expandedQuery && results.length < 10) {
    console.log(`Searching with expanded term in CID-11: "${expandedQuery}"`);
    const expandedResults = await searchICD11(expandedQuery, lang);
    
    if (expandedResults.length > 0) {
      // Mesclar sem duplicar por código
      const existingCodes = new Set(results.map(r => r.code));
      const newResults = expandedResults.filter((r: any) => !existingCodes.has(r.code));
      results.push(...newResults);
      console.log(`Expanded term search added ${newResults.length} new results`);
    }
  }
  
  // Limitar a 20 resultados
  const finalResults = results.slice(0, 20);
  console.log(`Returning ${finalResults.length} total results`);
  
  return finalResults;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, version = '10', language = 'pt-BR' } = await req.json();

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

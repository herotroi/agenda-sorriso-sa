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

async function searchICD(query: string, version: string, language: string = 'pt'): Promise<any[]> {
  const token = await getOAuthToken();

  // Mapear versão para endpoint correto
  const releaseId = version === '10' ? '2019-04' : '2024-01';
  const versionPath = version === '10' ? 'icd/release/10' : 'icd/release/11';
  
  // Construir URL de busca com query parameters
  const baseUrl = `https://id.who.int/${versionPath}/${releaseId}/mms/search`;
  const searchParams = new URLSearchParams({
    q: query,
    useFlexisearch: 'true',
    flatResults: 'true',
  });
  const searchUrl = `${baseUrl}?${searchParams.toString()}`;
  
  console.log(`Searching ICD-${version} for query: "${query}"`);
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
    throw new Error(`Failed to search ICD-${version}`);
  }

  const searchData = await searchResponse.json();
  
  // Formatar resultados
  const results = (searchData.destinationEntities || []).map((entity: any) => {
    // Extrair código do theCode ou ID
    let code = entity.theCode || '';
    if (!code && entity.id) {
      // Tentar extrair código do ID (ex: http://id.who.int/icd/entity/123456789)
      const match = entity.id.match(/\/([A-Z0-9.]+)$/);
      code = match ? match[1] : '';
    }

    return {
      code,
      title: entity.title || 'Sem título',
      version: `CID-${version}`,
      id: entity.id,
    };
  }).filter((result: any) => result.code); // Filtrar apenas resultados com código

  console.log(`Found ${results.length} results for ICD-${version}`);
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

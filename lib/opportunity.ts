import { lookup } from 'node:dns/promises';
import { createHash, randomBytes } from 'node:crypto';

export type LinkMetadata = {
  title: string;
  description: string;
  company: string;
  location: string;
  category: string;
  employmentType: string;
  workMode: string;
  salary: string;
  sourceUrl: string;
};

type JsonObject = Record<string, unknown>;

const FETCH_TIMEOUT_MS = 6500;
const MAX_HTML_SIZE = 450_000;
const MAX_REDIRECTS = 4;

/**
 * Gera um token privado para que o responsável
 * possa gerenciar ou remover sua oportunidade.
 */
export function createOwnerToken(): {
  token: string;
  tokenHash: string;
} {
  const token = randomBytes(32).toString('base64url');

  return {
    token,
    tokenHash: hashOwnerToken(token),
  };
}

/**
 * Gera o hash SHA-256 do token de gerenciamento.
 * O banco deve armazenar o hash, não o token original.
 */
export function hashOwnerToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Verifica se um endereço IPv4 é privado ou reservado.
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.');

  if (
    parts.length !== 4 ||
    parts.some(
      (part) =>
        !/^\d+$/.test(part) ||
        Number(part) < 0 ||
        Number(part) > 255
    )
  ) {
    return true;
  }

  const [a, b, c] = parts.map(Number);

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113)
  );
}

/**
 * Verifica endereços IPv6 locais, privados ou reservados.
 */
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase().split('%')[0];

  if (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    /^fe[89ab]/.test(normalized) ||
    normalized.startsWith('ff')
  ) {
    return true;
  }

  // Bloqueia endereços IPv4 mapeados em IPv6.
  const mappedMatch = normalized.match(
    /^(?:::ffff:)(\d{1,3}(?:\.\d{1,3}){3})$/
  );

  if (mappedMatch) {
    return isPrivateIPv4(mappedMatch[1]);
  }

  return false;
}

/**
 * Verifica se um endereço IP deve ser bloqueado.
 */
function isPrivateIp(ip: string): boolean {
  if (ip.includes(':')) {
    return isPrivateIPv6(ip);
  }

  return isPrivateIPv4(ip);
}

/**
 * Valida a URL informada pelo usuário.
 *
 * Aceita somente HTTP/HTTPS e bloqueia endereços
 * locais ou formatos potencialmente perigosos.
 */
export function validatePublicUrl(raw: string): URL {
  let url: URL;

  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error('Informe uma URL válida.');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('A URL deve utilizar HTTP ou HTTPS.');
  }

  if (url.username || url.password) {
    throw new Error('URLs com credenciais não são permitidas.');
  }

  if (!url.hostname) {
    throw new Error('A URL não possui um endereço válido.');
  }

  const host = url.hostname
    .toLowerCase()
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .replace(/\.$/, '');

  const blockedHosts = new Set([
    'localhost',
    'localhost.localdomain',
    'metadata.google.internal',
    'metadata',
    'host.docker.internal',
    'gateway.docker.internal',
  ]);

  if (
    blockedHosts.has(host) ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    throw new Error('Endereços privados não são permitidos.');
  }

  // Bloqueia IPv4 e IPv6 privados ou reservados.
  if (
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) ||
    host.includes(':')
  ) {
    if (isPrivateIp(host)) {
      throw new Error('Endereços privados não são permitidos.');
    }
  }

  // Não permite portas fora das portas HTTP/HTTPS padrão.
  if (url.port && url.port !== '80' && url.port !== '443') {
    throw new Error('Esta porta não é permitida.');
  }

  // Remove o fragmento, que não é necessário para a requisição.
  url.hash = '';

  return url;
}

/**
 * Resolve o domínio e verifica os endereços IP retornados.
 *
 * Essa verificação ajuda a reduzir o risco de SSRF.
 * Em produção, a rede também deve bloquear conexões
 * a endereços privados e metadados de nuvem.
 */
async function assertPublicDestination(url: URL): Promise<void> {
  const hostname = url.hostname
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .toLowerCase();

  // Se o host já for um IP, valide diretamente.
  if (
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) ||
    hostname.includes(':')
  ) {
    if (isPrivateIp(hostname)) {
      throw new Error('O destino da URL não é permitido.');
    }

    return;
  }

  let addresses: Array<{ address: string; family: number }>;

  try {
    addresses = await lookup(hostname, {
      all: true,
      verbatim: true,
    });
  } catch {
    throw new Error('Não foi possível verificar o domínio informado.');
  }

  if (
    addresses.length === 0 ||
    addresses.some((entry) => isPrivateIp(entry.address))
  ) {
    throw new Error('O domínio aponta para um endereço não permitido.');
  }
}

/**
 * Decodifica entidades HTML comuns.
 */
function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_match, number: string) => {
      const code = Number(number);

      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : '';
    })
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex: string) => {
      const code = Number.parseInt(hex, 16);

      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : '';
    });
}

/**
 * Remove tags HTML e normaliza espaços.
 */
function clean(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return decodeHtml(
    value
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Obtém o conteúdo de uma meta tag.
 */
function meta(html: string, key: string): string {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const patterns = [
    new RegExp(
      `<meta\\b[^>]*(?:property|name|itemprop)=["']${escapedKey}["'][^>]*content=["']([^"']*)["'][^>]*>`,
      'i'
    ),
    new RegExp(
      `<meta\\b[^>]*content=["']([^"']*)["'][^>]*(?:property|name|itemprop)=["']${escapedKey}["'][^>]*>`,
      'i'
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return clean(match[1]);
    }
  }

  return '';
}

/**
 * Procura dados estruturados JSON-LD de vagas.
 */
function parseJsonLd(html: string): JsonObject | null {
  const scripts = html.match(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi
  );

  if (!scripts) {
    return null;
  }

  for (const script of scripts) {
    const jsonText = script
      .replace(/^<script\b[^>]*>/i, '')
      .replace(/<\/script>$/i, '')
      .trim();

    try {
      const parsed: unknown = JSON.parse(jsonText);
      const found = findJobPosting(parsed);

      if (found) {
        return found;
      }
    } catch {
      // Ignora JSON-LD inválido e continua procurando.
    }
  }

  return null;
}

/**
 * Localiza um objeto JobPosting dentro de um JSON-LD,
 * inclusive quando ele estiver em @graph ou em um array.
 */
function findJobPosting(value: unknown): JsonObject | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const result = findJobPosting(item);

      if (result) {
        return result;
      }
    }

    return null;
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  const object = value as JsonObject;
  const type = object['@type'];

  const types = Array.isArray(type) ? type : [type];

  if (types.includes('JobPosting')) {
    return object;
  }

  if (object['@graph']) {
    return findJobPosting(object['@graph']);
  }

  return null;
}

/**
 * Converte campos estruturados em texto.
 */
function valueToText(value: unknown): string {
  if (typeof value === 'string') {
    return clean(value);
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(valueToText).filter(Boolean).join(', ');
  }

  if (value && typeof value === 'object') {
    const object = value as JsonObject;

    if (typeof object.name === 'string') {
      return clean(object.name);
    }

    if (typeof object.addressLocality === 'string') {
      const locality = clean(object.addressLocality);
      const region = clean(object.addressRegion);

      return [locality, region].filter(Boolean).join(' - ');
    }
  }

  return '';
}

/**
 * Obtém o nome da empresa em dados JobPosting.
 */
function getCompany(job: JsonObject | null): string {
  if (!job) {
    return '';
  }

  const hiringOrganization = job.hiringOrganization;

  if (
    hiringOrganization &&
    typeof hiringOrganization === 'object' &&
    !Array.isArray(hiringOrganization)
  ) {
    return valueToText(
      (hiringOrganization as JsonObject).name
    );
  }

  return '';
}

/**
 * Obtém a localização em dados JobPosting.
 */
function getLocation(job: JsonObject | null): string {
  if (!job) {
    return '';
  }

  const locations = job.jobLocation;

  if (!locations) {
    return '';
  }

  const list = Array.isArray(locations) ? locations : [locations];

  const results: string[] = [];

  for (const item of list) {
    if (!item || typeof item !== 'object') {
      continue;
    }

    const object = item as JsonObject;
    const address = object.address;

    if (address && typeof address === 'object') {
      const addr = address as JsonObject;

      const locality = valueToText(addr.addressLocality);
      const region = valueToText(addr.addressRegion);
      const country = valueToText(addr.addressCountry);

      const formatted = [locality, region, country]
        .filter(Boolean)
        .join(' - ');

      if (formatted) {
        results.push(formatted);
      }
    }
  }

  return [...new Set(results)].join('; ');
}

/**
 * Obtém uma faixa salarial, se disponível.
 */
function getSalary(job: JsonObject | null): string {
  if (!job) {
    return '';
  }

  const salary = job.baseSalary;

  if (!salary || typeof salary !== 'object') {
    return '';
  }

  const salaryObject = salary as JsonObject;
  const currency =
    typeof salaryObject.currency === 'string'
      ? salaryObject.currency
      : 'BRL';

  const value = salaryObject.value;

  if (!value || typeof value !== 'object') {
    return '';
  }

  const valueObject = value as JsonObject;

  const minimum = valueObject.minValue;
  const maximum = valueObject.maxValue;
  const single = valueObject.value;
  const unit = valueObject.unitText;

  let result = '';

  if (minimum != null && maximum != null) {
    result = `${minimum} - ${maximum}`;
  } else if (single != null) {
    result = String(single);
  } else if (minimum != null) {
    result = `A partir de ${minimum}`;
  } else if (maximum != null) {
    result = `Até ${maximum}`;
  }

  if (!result) {
    return '';
  }

  return `${currency} ${result}${unit ? ` / ${unit}` : ''}`;
}

/**
 * Infere a categoria usando o título e a descrição.
 */
function inferCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  if (
    /desenvolvedor|programador|software|frontend|front-end|backend|back-end|full.?stack|javascript|typescript|react|next\.?js|node\.?js|python|java|php|ti\b|tecnologia da informação/.test(
      text
    )
  ) {
    return 'Tecnologia';
  }

  if (
    /design|designer|figma|ilustração|identidade visual|edição de vídeo/.test(
      text
    )
  ) {
    return 'Design';
  }

  if (
    /marketing|social media|tráfego pago|publicidade|copywriter|redator/.test(
      text
    )
  ) {
    return 'Marketing';
  }

  if (
    /vendedor|vendas|comercial|representante comercial/.test(text)
  ) {
    return 'Vendas';
  }

  if (
    /administrativo|assistente administrativo|secretária|recepcionista/.test(
      text
    )
  ) {
    return 'Administrativo';
  }

  if (/entrega|motorista|logística|estoquista/.test(text)) {
    return 'Logística';
  }

  if (/limpeza|diarista|jardineiro|manutenção/.test(text)) {
    return 'Serviços Gerais';
  }

  return '';
}

/**
 * Infere o formato de trabalho.
 */
function inferWorkMode(text: string): string {
  const normalized = text.toLowerCase();

  if (/híbrido|híbrida|hybrid/.test(normalized)) {
    return 'Híbrido';
  }

  if (/remoto|remota|home office|home-office|remote|teletrabalho/.test(normalized)) {
    return 'Remoto';
  }

  if (/presencial|on-site|onsite/.test(normalized)) {
    return 'Presencial';
  }

  return '';
}

/**
 * Infere o tipo de vínculo.
 */
function inferEmploymentType(text: string): string {
  const normalized = text.toLowerCase();

  if (/freelancer|freelance|freela/.test(normalized)) {
    return 'Freelancer';
  }

  if (/estágio|estagiário|estagiária|internship/.test(normalized)) {
    return 'Estágio';
  }

  if (/\bpj\b|pessoa jurídica/.test(normalized)) {
    return 'PJ';
  }

  if (/\bclt\b|carteira assinada/.test(normalized)) {
    return 'CLT';
  }

  if (/temporário|temporária|contrato temporário/.test(normalized)) {
    return 'Temporário';
  }

  if (/autônomo|autônoma|por projeto/.test(normalized)) {
    return 'Autônomo';
  }

  return '';
}

/**
 * Faz uma requisição HTTP com timeout e sem seguir redirects
 * automaticamente, permitindo validar cada destino.
 */
async function fetchWithTimeout(
  url: URL
): Promise<Response> {
  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    FETCH_TIMEOUT_MS
  );

  try {
    return await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'ConectaTrampoBot/1.0 (+https://conectatrampo.vercel.app)',
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Lê somente uma quantidade limitada de HTML.
 */
async function readLimitedHtml(
  response: Response
): Promise<string> {
  if (!response.body) {
    return '';
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (total < MAX_HTML_SIZE) {
      const { done, value } = await reader.read();

      if (done || !value) {
        break;
      }

      const remaining = MAX_HTML_SIZE - total;
      const chunk = value.slice(0, remaining);

      chunks.push(chunk);
      total += chunk.length;

      if (chunk.length < value.length) {
        break;
      }
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }

  const combined = new Uint8Array(total);
  let offset = 0;

  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return new TextDecoder('utf-8').decode(combined);
}

/**
 * Extrai título, descrição, empresa, localização e outros dados
 * de uma página pública de oportunidade.
 *
 * Importante:
 * - Não inventa informações ausentes.
 * - Pode não funcionar em páginas que exigem login.
 * - Alguns sites bloqueiam requisições automatizadas.
 */
export async function extractLinkMetadata(
  rawUrl: string
): Promise<LinkMetadata> {
  const emptyMetadata = (sourceUrl: string): LinkMetadata => ({
    title: '',
    description: '',
    company: '',
    location: '',
    category: '',
    employmentType: '',
    workMode: '',
    salary: '',
    sourceUrl,
  });

  let currentUrl: URL;

  try {
    currentUrl = validatePublicUrl(rawUrl);
  } catch {
    throw new Error(
      'Não foi possível utilizar esse endereço. Verifique a URL e tente novamente.'
    );
  }

  try {
    let response: Response | null = null;

    for (let attempt = 0; attempt <= MAX_REDIRECTS; attempt++) {
      await assertPublicDestination(currentUrl);

      response = await fetchWithTimeout(currentUrl);

      if (
        response.status >= 300 &&
        response.status < 400
      ) {
        const location = response.headers.get('location');

        await response.body?.cancel().catch(() => undefined);

        if (!location) {
          throw new Error('Redirecionamento sem destino.');
        }

        if (attempt === MAX_REDIRECTS) {
          throw new Error('Limite de redirecionamentos atingido.');
        }

        const redirectedUrl = new URL(location, currentUrl);

        currentUrl = validatePublicUrl(redirectedUrl.toString());

        continue;
      }

      break;
    }

    if (!response || !response.ok) {
      return emptyMetadata(currentUrl.toString());
    }

    const contentType = response.headers.get('content-type') || '';

    if (!contentType.toLowerCase().includes('text/html')) {
      await response.body?.cancel().catch(() => undefined);

      return emptyMetadata(currentUrl.toString());
    }

    const html = await readLimitedHtml(response);

    const job = parseJsonLd(html);

    const htmlTitle =
      meta(html, 'og:title') ||
      meta(html, 'twitter:title') ||
      html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ||
      '';

    const htmlDescription =
      meta(html, 'og:description') ||
      meta(html, 'description') ||
      meta(html, 'twitter:description');

    const title =
      valueToText(job?.title) ||
      clean(htmlTitle);

    const description =
      valueToText(job?.description) ||
      clean(htmlDescription);

    const company = getCompany(job);
    const location = getLocation(job);
    const salary = getSalary(job);

    const combinedText = `${title} ${description}`;

    const category = inferCategory(title, description);
    const workMode = inferWorkMode(combinedText);
    const employmentType = inferEmploymentType(
      valueToText(job?.employmentType) || combinedText
    );

    return {
      title,
      description,
      company,
      location,
      category,
      employmentType,
      workMode,
      salary,
      sourceUrl: currentUrl.toString(),
    };
  } catch (error) {
    // Não expõe detalhes internos de rede ou DNS ao usuário.
    if (error instanceof Error && error.message.includes('não permitido')) {
      throw error;
    }

    return emptyMetadata(currentUrl.toString());
  }
}
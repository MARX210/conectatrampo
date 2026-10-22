import { NextRequest, NextResponse } from 'next/server';
import { requireDb } from '@/lib/db';
import { createOwnerToken, validatePublicUrl, extractLinkMetadata } from '@/lib/opportunity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonError(message: string, status = 400) { return NextResponse.json({ error: message }, { status }); }

export async function GET(request: NextRequest) {
  try {
    const sql = requireDb();
    const q = (request.nextUrl.searchParams.get('q') || '').trim().slice(0, 100);
    const category = (request.nextUrl.searchParams.get('category') || '').trim().slice(0, 80);
    const kind = (request.nextUrl.searchParams.get('kind') || '').trim().slice(0, 40);
    const rows = await sql`
      SELECT id, title, description, category, kind, location, mode, pay, contact,
             external_url AS url, source_type AS source, source_title AS "sourceTitle",
             created_at AS "createdAt", expires_at AS "expiresAt"
      FROM opportunities
      WHERE status = 'active' AND (expires_at IS NULL OR expires_at > NOW())
        AND (${q} = '' OR title ILIKE ${'%' + q + '%'} OR description ILIKE ${'%' + q + '%'} OR location ILIKE ${'%' + q + '%'})
        AND (${category} = '' OR category = ${category})
        AND (${kind} = '' OR kind = ${kind})
      ORDER BY created_at DESC LIMIT 200`;
    return NextResponse.json({ opportunities: rows });
  } catch (error) {
    if (error instanceof Error && error.message === 'DATABASE_NOT_CONFIGURED') return jsonError('Banco de dados ainda não configurado.', 503);
    return jsonError('Não foi possível carregar as oportunidades.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = String(body.url || '').trim();
    const rawKind = String(body.kind || 'Link externo');
    const linkOnly = rawKind === 'Link externo' && !String(body.title || '').trim() && !String(body.description || '').trim();
    if (url) validatePublicUrl(url);
    if (linkOnly && !url) return jsonError('Cole o link da oportunidade.');
    if (!linkOnly && !String(body.title || '').trim()) return jsonError('Informe o título da oportunidade.');
    if (!linkOnly && !String(body.description || '').trim()) return jsonError('Informe uma descrição.');
    if (!['Emprego', 'Freelance', 'Serviço', 'Link externo'].includes(rawKind)) return jsonError('Tipo de publicação inválido.');
    if (rawKind === 'Link externo' && !url) return jsonError('Informe o link externo.');

    const metadata = url ? await extractLinkMetadata(url) : null;
    const title = (String(body.title || '').trim() || metadata?.title || 'Oportunidade externa').slice(0, 160);
    const description = (String(body.description || '').trim() || metadata?.description || 'Consulte os detalhes e as condições diretamente na página original da oportunidade.').slice(0, 1800);
    const category = (String(body.category || '').trim() || metadata?.category || 'Outros').slice(0, 80);
    const kind = rawKind === 'Link externo' && metadata?.kind === 'Freelance' ? 'Freelance' : rawKind;
    const location = (String(body.location || '').trim() || metadata?.location || 'Joinville, SC').slice(0, 120);
    const mode = (String(body.mode || '').trim() || metadata?.mode || 'A combinar').slice(0, 40);
    const pay = (String(body.pay || '').trim() || metadata?.pay || '').slice(0, 120);
    const contact = String(body.contact || '').trim().slice(0, 180);
    const { token, hash } = createOwnerToken();
    const sql = requireDb();
    const inserted = await sql`
      INSERT INTO opportunities (title, description, category, kind, location, mode, pay, contact, external_url, source_type, source_title, owner_token_hash)
      VALUES (${title}, ${description}, ${category}, ${kind}, ${location}, ${mode}, ${pay}, ${contact}, ${url}, ${url ? 'external' : 'community'}, ${metadata?.sourceTitle || ''}, ${hash})
      RETURNING id, title, description, category, kind, location, mode, pay, contact, external_url AS url, source_type AS source, created_at AS "createdAt"`;
    const item = inserted[0];
    return NextResponse.json({ opportunity: item, managementToken: token, managementUrl: `/gerenciar/${token}`, metadataDetected: Boolean(metadata?.title || metadata?.description) }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'DATABASE_NOT_CONFIGURED') return jsonError('Banco de dados ainda não configurado.', 503);
    if (error instanceof Error && /link|endereço|privados|credenciais/i.test(error.message)) return jsonError(error.message);
    return jsonError('Não foi possível publicar. Confira os campos e tente novamente.', 500);
  }
}

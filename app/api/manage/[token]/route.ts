import { NextRequest, NextResponse } from 'next/server';
import { requireDb } from '@/lib/db';
import { hashOwnerToken } from '@/lib/opportunity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    if (!/^[A-Za-z0-9_-]{35,60}$/.test(token)) return NextResponse.json({ error: 'Link de gerenciamento inválido.' }, { status: 404 });
    const sql = requireDb();
    const rows = await sql`SELECT id, title, status, created_at AS "createdAt", external_url AS url FROM opportunities WHERE owner_token_hash = ${hashOwnerToken(token)} LIMIT 1`;
    if (!rows.length) return NextResponse.json({ error: 'Publicação não encontrada ou link de gerenciamento inválido.' }, { status: 404 });
    return NextResponse.json({ opportunity: rows[0] });
  } catch { return NextResponse.json({ error: 'Banco de dados indisponível.' }, { status: 503 }); }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    if (!/^[A-Za-z0-9_-]{35,60}$/.test(token)) return NextResponse.json({ error: 'Link de gerenciamento inválido.' }, { status: 404 });
    const sql = requireDb();
    const rows = await sql`UPDATE opportunities SET status = 'closed', updated_at = NOW() WHERE owner_token_hash = ${hashOwnerToken(token)} AND status = 'active' RETURNING id`;
    if (!rows.length) return NextResponse.json({ error: 'Publicação não encontrada ou já encerrada.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Não foi possível encerrar a publicação.' }, { status: 503 }); }
}

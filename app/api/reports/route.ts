import { NextRequest, NextResponse } from 'next/server';
import { requireDb } from '@/lib/db';
export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = String(body.opportunityId || '');
    const reason = String(body.reason || '').slice(0, 80);
    const details = String(body.details || '').trim().slice(0, 1000);
    if (!/^[0-9a-f-]{36}$/i.test(id) || !reason) return NextResponse.json({ error: 'Informe a publicação e o motivo da denúncia.' }, { status: 400 });
    const sql = requireDb();
    const rows = await sql`INSERT INTO opportunity_reports (opportunity_id, reason, details) SELECT id, ${reason}, ${details} FROM opportunities WHERE id = ${id} AND status = 'active' RETURNING id`;
    if (!rows.length) return NextResponse.json({ error: 'Publicação não encontrada.' }, { status: 404 });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Não foi possível registrar a denúncia.' }, { status: 503 }); }
}

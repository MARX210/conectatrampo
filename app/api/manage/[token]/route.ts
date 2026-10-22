import { NextRequest, NextResponse } from 'next/server';

import { requireDb } from '@/lib/db';
import { hashOwnerToken, validatePublicUrl } from '@/lib/opportunity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ token: string }>;
};

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

function getTokenHash(token: string): string {
  if (
    !token ||
    token.length < 30 ||
    token.length > 100
  ) {
    throw new Error('TOKEN_INVALID');
  }

  return hashOwnerToken(token);
}

/**
 * GET /api/manage/[token]
 *
 * Busca uma oportunidade usando o token privado
 * de gerenciamento.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { token } = await context.params;
    const tokenHash = getTokenHash(token);
    const sql = requireDb();

    const rows = await sql`
      SELECT
        id,
        title,
        description,
        category,
        kind,
        location,
        mode,
        pay,
        contact,
        external_url AS url,
        status,
        created_at AS "createdAt"
      FROM opportunities
      WHERE owner_token_hash = ${tokenHash}
      LIMIT 1
    `;

    if (!rows.length) {
      return errorResponse(
        'Publicação não encontrada ou link inválido.',
        404
      );
    }

    return NextResponse.json({
      opportunity: rows[0],
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'TOKEN_INVALID'
    ) {
      return errorResponse('Link de gerenciamento inválido.', 400);
    }

    console.error('Erro ao buscar publicação:', error);

    return errorResponse(
      'Não foi possível carregar a publicação.',
      500
    );
  }
}

/**
 * PATCH /api/manage/[token]
 *
 * Edita uma oportunidade, marca como preenchida
 * ou reativa uma publicação.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { token } = await context.params;
    const tokenHash = getTokenHash(token);

    const body = await request.json();

    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body)
    ) {
      return errorResponse('Dados inválidos.');
    }

    const sql = requireDb();

    /*
     * Permite atualizar apenas o status sem
     * modificar os demais campos.
     */
    if (body.status !== undefined) {
      const allowedStatuses = ['active', 'filled'];

      if (!allowedStatuses.includes(body.status)) {
        return errorResponse('Status inválido.');
      }

      const updated = await sql`
        UPDATE opportunities
        SET status = ${body.status}
        WHERE owner_token_hash = ${tokenHash}
        RETURNING id, status
      `;

      if (!updated.length) {
        return errorResponse(
          'Publicação não encontrada.',
          404
        );
      }

      return NextResponse.json({
        success: true,
        opportunity: updated[0],
      });
    }

    /*
     * Valida os campos que podem ser editados.
     */
    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();
    const category = String(body.category || '').trim();
    const kind = String(body.kind || '').trim();
    const location = String(body.location || '').trim();
    const mode = String(body.mode || '').trim();
    const pay = String(body.pay || '').trim();
    const contact = String(body.contact || '').trim();
    const url = String(body.url || '').trim();

    if (!title) {
      return errorResponse('Informe o título.');
    }

    if (!description) {
      return errorResponse('Informe a descrição.');
    }

    if (title.length > 160) {
      return errorResponse('O título deve ter até 160 caracteres.');
    }

    if (description.length > 1800) {
      return errorResponse(
        'A descrição deve ter até 1.800 caracteres.'
      );
    }

    if (category.length > 80) {
      return errorResponse(
        'A categoria deve ter até 80 caracteres.'
      );
    }

    if (location.length > 120) {
      return errorResponse(
        'A localização deve ter até 120 caracteres.'
      );
    }

    if (mode.length > 40 || pay.length > 120) {
      return errorResponse(
        'Verifique a modalidade e a remuneração.'
      );
    }

    if (contact.length > 180) {
      return errorResponse(
        'O contato deve ter até 180 caracteres.'
      );
    }

    const allowedKinds = [
      'Emprego',
      'Freelance',
      'Serviço',
      'Link externo',
    ];

    if (!allowedKinds.includes(kind)) {
      return errorResponse(
        'Tipo de oportunidade inválido.'
      );
    }

    if (url) {
      try {
        validatePublicUrl(url);
      } catch {
        return errorResponse(
          'O endereço externo informado é inválido.'
        );
      }
    }

    const updated = await sql`
      UPDATE opportunities
      SET
        title = ${title},
        description = ${description},
        category = ${category},
        kind = ${kind},
        location = ${location},
        mode = ${mode},
        pay = ${pay},
        contact = ${contact},
        external_url = ${url || null}
      WHERE owner_token_hash = ${tokenHash}
      RETURNING
        id,
        title,
        description,
        category,
        kind,
        location,
        mode,
        pay,
        contact,
        external_url AS url,
        status
    `;

    if (!updated.length) {
      return errorResponse(
        'Publicação não encontrada.',
        404
      );
    }

    return NextResponse.json({
      success: true,
      opportunity: updated[0],
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'TOKEN_INVALID'
    ) {
      return errorResponse('Link de gerenciamento inválido.', 400);
    }

    console.error('Erro ao atualizar publicação:', error);

    return errorResponse(
      'Não foi possível atualizar a publicação.',
      500
    );
  }
}

/**
 * DELETE /api/manage/[token]
 *
 * Exclui definitivamente a publicação do banco.
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { token } = await context.params;
    const tokenHash = getTokenHash(token);
    const sql = requireDb();

    const deleted = await sql`
      DELETE FROM opportunities
      WHERE owner_token_hash = ${tokenHash}
      RETURNING id
    `;

    if (!deleted.length) {
      return errorResponse(
        'Publicação não encontrada.',
        404
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Publicação excluída com sucesso.',
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'TOKEN_INVALID'
    ) {
      return errorResponse('Link de gerenciamento inválido.', 400);
    }

    console.error('Erro ao excluir publicação:', error);

    return errorResponse(
      'Não foi possível excluir a publicação.',
      500
    );
  }
}
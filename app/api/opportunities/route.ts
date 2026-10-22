import { NextRequest, NextResponse } from 'next/server';

import { requireDb } from '@/lib/db';

import {
  createOwnerToken,
  validatePublicUrl,
  extractLinkMetadata,
} from '@/lib/opportunity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonError(
  message: string,
  status = 400
) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

/**
 * GET /api/opportunities
 *
 * Lista oportunidades ativas, permitindo pesquisa
 * por texto, categoria e tipo de oportunidade.
 */
export async function GET(request: NextRequest) {
  try {
    const sql = requireDb();

    const q = (
      request.nextUrl.searchParams.get('q') || ''
    ).trim().slice(0, 100);

    const category = (
      request.nextUrl.searchParams.get('category') || ''
    ).trim().slice(0, 80);

    const kind = (
      request.nextUrl.searchParams.get('kind') || ''
    ).trim().slice(0, 40);

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
        source_type AS source,
        source_title AS "sourceTitle",
        created_at AS "createdAt",
        expires_at AS "expiresAt"
      FROM opportunities
      WHERE
        status = 'active'
        AND (
          expires_at IS NULL
          OR expires_at > NOW()
        )
        AND (
          ${q} = ''
          OR title ILIKE ${'%' + q + '%'}
          OR description ILIKE ${'%' + q + '%'}
          OR location ILIKE ${'%' + q + '%'}
        )
        AND (
          ${category} = ''
          OR category = ${category}
        )
        AND (
          ${kind} = ''
          OR kind = ${kind}
        )
      ORDER BY created_at DESC
      LIMIT 200
    `;

    return NextResponse.json({
      opportunities: rows,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'DATABASE_NOT_CONFIGURED'
    ) {
      return jsonError(
        'Banco de dados ainda não configurado.',
        503
      );
    }

    console.error(
      'Erro ao carregar oportunidades:',
      error
    );

    return jsonError(
      'Não foi possível carregar as oportunidades.',
      500
    );
  }
}

/**
 * POST /api/opportunities
 *
 * Publica uma oportunidade.
 *
 * Aceita:
 * - Link externo de uma oportunidade existente.
 * - Vaga de emprego.
 * - Trabalho freelance.
 * - Oferta de serviço.
 *
 * Para links externos, tenta extrair os metadados
 * disponíveis na página original.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body)
    ) {
      return jsonError(
        'Os dados enviados são inválidos.'
      );
    }

    const url = String(body.url || '').trim();

    const rawKind = String(
      body.kind || 'Link externo'
    ).trim();

    const allowedKinds = [
      'Emprego',
      'Freelance',
      'Serviço',
      'Link externo',
    ];

    if (!allowedKinds.includes(rawKind)) {
      return jsonError(
        'Tipo de publicação inválido.'
      );
    }

    const inputTitle = String(
      body.title || ''
    ).trim();

    const inputDescription = String(
      body.description || ''
    ).trim();

    const linkOnly =
      rawKind === 'Link externo' &&
      !inputTitle &&
      !inputDescription;

    if (url) {
      try {
        validatePublicUrl(url);
      } catch (error) {
        return jsonError(
          error instanceof Error
            ? error.message
            : 'O link informado é inválido.'
        );
      }
    }

    if (linkOnly && !url) {
      return jsonError(
        'Cole o link da oportunidade.'
      );
    }

    if (
      !linkOnly &&
      !inputTitle
    ) {
      return jsonError(
        'Informe o título da oportunidade.'
      );
    }

    if (
      !linkOnly &&
      !inputDescription
    ) {
      return jsonError(
        'Informe uma descrição.'
      );
    }

    if (
      rawKind === 'Link externo' &&
      !url
    ) {
      return jsonError(
        'Informe o link externo.'
      );
    }

    /*
     * Extrai os metadados do endereço.
     * Se a página não fornecer informações,
     * os campos poderão ser preenchidos manualmente.
     */
    const metadata = url
      ? await extractLinkMetadata(url)
      : null;

    const title = (
      inputTitle ||
      metadata?.title ||
      'Oportunidade externa'
    ).slice(0, 160);

    const description = (
      inputDescription ||
      metadata?.description ||
      'Consulte os detalhes e as condições diretamente na página original da oportunidade.'
    ).slice(0, 1800);

    const category = (
      String(body.category || '').trim() ||
      metadata?.category ||
      'Outros'
    ).slice(0, 80);

    /*
     * LinkMetadata utiliza employmentType,
     * não a propriedade inexistente "kind".
     */
    let kind = rawKind;

    if (rawKind === 'Link externo') {
      const employmentType =
        metadata?.employmentType?.toLowerCase() || '';

      if (
        employmentType === 'freelancer' ||
        employmentType === 'freelance'
      ) {
        kind = 'Freelance';
      }
    }

    const location = (
      String(body.location || '').trim() ||
      metadata?.location ||
      'Joinville, SC'
    ).slice(0, 120);

    /*
     * LinkMetadata utiliza workMode,
     * não a propriedade inexistente "mode".
     */
    const mode = (
      String(body.mode || '').trim() ||
      metadata?.workMode ||
      'A combinar'
    ).slice(0, 40);

    /*
     * LinkMetadata utiliza salary,
     * não a propriedade inexistente "pay".
     */
    const pay = (
      String(body.pay || '').trim() ||
      metadata?.salary ||
      ''
    ).slice(0, 120);

    const contact = String(
      body.contact || ''
    ).trim().slice(0, 180);

    /*
     * Gera um token de gerenciamento.
     * Somente o hash será armazenado no banco.
     */
    const {
      token,
      tokenHash,
    } = createOwnerToken();

    const sql = requireDb();

    const inserted = await sql`
      INSERT INTO opportunities (
        title,
        description,
        category,
        kind,
        location,
        mode,
        pay,
        contact,
        external_url,
        source_type,
        source_title,
        owner_token_hash
      )
      VALUES (
        ${title},
        ${description},
        ${category},
        ${kind},
        ${location},
        ${mode},
        ${pay},
        ${contact},
        ${url || null},
        ${url ? 'external' : 'community'},
        ${metadata?.title || ''},
        ${tokenHash}
      )
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
        source_type AS source,
        source_title AS "sourceTitle",
        created_at AS "createdAt"
    `;

    const item = inserted[0];

    if (!item) {
      return jsonError(
        'Não foi possível salvar a oportunidade.',
        500
      );
    }

    /*
     * O token original é entregue ao publicador
     * para que possa gerenciar a publicação.
     *
     * Não armazene esse token original no banco.
     */
    return NextResponse.json(
      {
        opportunity: item,
        managementToken: token,
        managementUrl: `/gerenciar/${token}`,
        metadataDetected: Boolean(
          metadata?.title ||
          metadata?.description
        ),
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'DATABASE_NOT_CONFIGURED'
    ) {
      return jsonError(
        'Banco de dados ainda não configurado.',
        503
      );
    }

    console.error(
      'Erro ao publicar oportunidade:',
      error
    );

    return jsonError(
      'Não foi possível publicar. Confira os campos e tente novamente.',
      500
    );
  }
}
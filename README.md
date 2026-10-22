# ConectaTrampo

Portal gratuito de oportunidades, links externos, freelancers e serviços, com foco inicial em Joinville/SC.

## O que está implementado
- Página pública sem vagas demonstrativas: o site começa vazio e mostra apenas publicações reais do banco.
- Publicação de link externo com apenas um campo obrigatório: o sistema tenta detectar título, descrição, organização, categoria, localização, modalidade e remuneração a partir de Open Graph, meta description e Schema.org `JobPosting`.
- Formulários para empresas/pessoas publicarem empregos, procura por freelancer e serviços.
- PostgreSQL no Neon para que todas as publicações sejam compartilhadas entre visitantes e dispositivos.
- Link privado de gerenciamento gerado na publicação. O publicador pode guardar esse link e encerrar a oportunidade sem criar conta.
- Denúncia de anúncios via API, preparada para ser ligada a um botão de denúncia na interface.
- Validação básica de URLs, redirects manuais, timeout e limite de leitura ao buscar metadados.
- Documentos iniciais de privacidade, termos e cookies; sem scripts publicitários de rastreamento.

## Requisitos
- Node.js 20.9+
- Conta Neon PostgreSQL
- npm

## Configurar o banco Neon
1. Crie um projeto PostgreSQL no Neon.
2. Abra o SQL Editor no painel Neon.
3. Copie e execute o conteúdo de `database/schema.sql`.
4. No Neon, copie a connection string **pooled** para uso da aplicação.
5. Crie um arquivo `.env.local` na raiz com:

```env
DATABASE_URL=postgresql://...sua-connection-string-do-neon...
```

Não compartilhe `.env.local`, não faça commit e nunca use `NEXT_PUBLIC_DATABASE_URL`.

## Executar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Como funciona o link externo
A pessoa seleciona “Tenho apenas um link”, cola a URL e publica. O servidor tenta extrair metadados públicos do HTML. Muitos sites bloqueiam robôs, exigem login ou não disponibilizam os dados estruturados; nesses casos o anúncio usa um título genérico e mantém o link original para o visitante abrir. A extração não é garantida e o sistema não afirma que a vaga continua aberta.

## Como o publicador encerra a publicação
Após publicar, o sistema mostra uma chave de gerenciamento secreta uma única vez. O usuário deve copiar e guardar a URL privada. A posse desse link permite encerrar o anúncio; se o link for perdido, não há recuperação automática na versão atual. Não compartilhe essa URL. No banco, armazenamos apenas o hash da chave.

## API
- `GET /api/opportunities` — lista oportunidades ativas; aceita `q`, `category` e `kind`.
- `POST /api/opportunities` — cria oportunidade e retorna link privado de gerenciamento.
- `GET /api/manage/:token` — consulta a publicação ligada ao token.
- `DELETE /api/manage/:token` — encerra a publicação.
- `POST /api/reports` — registra uma denúncia (a interface de denúncia ainda precisa ser conectada).

## Antes de publicar na internet
Este é um MVP inicial, não uma auditoria de segurança. Antes do lançamento público, implemente rate limiting por IP/conta, CAPTCHA adaptativo, e-mail opcional para recuperação do link de gerenciamento, painel administrativo autenticado para analisar denúncias, monitoramento de abusos e testes de segurança. A extração de URL do servidor requer uma revisão de SSRF/DNS rebinding e idealmente um serviço isolado de pré-visualização; as validações atuais são defesa inicial, não garantia completa. Defina também os dados reais do controlador da plataforma nas políticas jurídicas e revise os textos com profissional qualificado.

## Deploy na Vercel
Importe o repositório GitHub, configure `DATABASE_URL` em Project Settings → Environment Variables e faça deploy. Execute `database/schema.sql` no Neon antes de testar o site publicado.

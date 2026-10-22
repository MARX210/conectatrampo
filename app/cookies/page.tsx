export const metadata = {
  title: "Política de Cookies | ConectaTrampo",
  description:
    "Saiba como o ConectaTrampo utiliza cookies e tecnologias de armazenamento.",
};

const sections = [
  {
    title: "1. O que são cookies?",
    content:
      "Cookies são pequenos arquivos armazenados no navegador ou dispositivo do usuário quando ele acessa um site. Eles podem ajudar a manter funcionalidades, lembrar preferências e compreender como um serviço é utilizado.",
  },
  {
    title: "2. Como utilizamos essas tecnologias?",
    content:
      "O ConectaTrampo pode utilizar cookies e tecnologias semelhantes para permitir o funcionamento da plataforma, manter preferências e melhorar a experiência de navegação. As tecnologias efetivamente utilizadas dependem da configuração e dos recursos habilitados no site.",
  },
  {
    title: "3. Armazenamento no navegador",
    content:
      "Além dos cookies, aplicações web podem utilizar recursos como localStorage e sessionStorage. Esses mecanismos armazenam informações no próprio navegador e não são a mesma coisa que cookies. Sua utilização pelo ConectaTrampo deve corresponder às funcionalidades efetivamente implementadas.",
  },
  {
    title: "4. Cookies essenciais",
    content:
      "Cookies estritamente necessários, quando utilizados, podem ser importantes para o funcionamento e a segurança de determinadas funcionalidades. Eles não devem ser confundidos com cookies de publicidade ou de análise de comportamento.",
  },
  {
    title: "5. Cookies de análise e publicidade",
    content:
      "Cookies de análise, publicidade ou rastreamento de terceiros somente devem ser utilizados quando esses serviços estiverem efetivamente integrados à plataforma. Caso sejam implementados, as informações correspondentes e os mecanismos de consentimento aplicáveis deverão ser apresentados ao usuário.",
  },
  {
    title: "6. Como gerenciar cookies?",
    content:
      "O usuário pode consultar as configurações do navegador para visualizar, bloquear ou excluir cookies. O bloqueio de determinadas tecnologias poderá afetar o funcionamento de alguns recursos do site.",
  },
  {
    title: "7. Alterações nesta política",
    content:
      "Esta política poderá ser atualizada em razão de mudanças nas funcionalidades, nas tecnologias utilizadas ou nas exigências legais. A versão vigente estará disponível nesta página.",
  },
];

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl">
        <header className="mb-10 border-b border-white/10 pb-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
          >
            <span aria-hidden="true">←</span>
            Voltar ao ConectaTrampo
          </a>

          <div className="mt-8 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Transparência
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
            Política de Cookies
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-400">
            Entenda como cookies e outras tecnologias de armazenamento podem
            ser utilizados durante sua navegação no ConectaTrampo.
          </p>

          <p className="mt-4 text-sm text-slate-500">
            Última atualização: 22 de outubro de 2026
          </p>
        </header>

        <div className="mb-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
          <h2 className="font-semibold text-emerald-300">
            Nosso compromisso
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-300">
            Buscamos utilizar apenas as tecnologias necessárias para oferecer
            uma experiência funcional, segura e transparente. A descrição
            definitiva desta política deve refletir os recursos realmente
            habilitados no site.
          </p>
        </div>

        <div className="space-y-5">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7"
            >
              <h2 className="text-lg font-semibold text-white">
                {section.title}
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        <footer className="mt-10 border-t border-white/10 pt-6">
          <p className="text-sm leading-6 text-slate-500">
            Para dúvidas sobre esta política, utilize o canal de contato oficial
            informado na Política de Privacidade.
          </p>

          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <a
              href="/privacidade"
              className="text-emerald-400 hover:text-emerald-300"
            >
              Política de Privacidade
            </a>

            <a
              href="/termos"
              className="text-emerald-400 hover:text-emerald-300"
            >
              Termos de Uso
            </a>
          </div>
        </footer>
      </article>
    </main>
  );
}
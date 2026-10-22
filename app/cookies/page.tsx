import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies | ConectaTrampo",
  description:
    "Entenda como cookies e tecnologias de armazenamento podem ser utilizados no ConectaTrampo.",
};

const sections = [
  {
    title: "1. O que são cookies?",
    paragraphs: [
      "Cookies são pequenos arquivos que podem ser armazenados no navegador durante a visita a um site. Eles podem permitir o funcionamento de recursos, guardar preferências e auxiliar na segurança e na análise de utilização.",
    ],
  },
  {
    title: "2. Como o ConectaTrampo utiliza essas tecnologias?",
    paragraphs: [
      "A utilização de cookies depende dos recursos efetivamente implementados na plataforma. Eles podem ser utilizados para viabilizar funcionalidades, preservar preferências ou contribuir para a segurança do serviço.",
      "A existência de um banco de dados não significa, por si só, que o site utiliza cookies. O armazenamento de informações no servidor e o armazenamento no navegador são mecanismos diferentes.",
    ],
  },
  {
    title: "3. Armazenamento no navegador",
    paragraphs: [
      "Aplicações web também podem utilizar recursos como localStorage e sessionStorage para manter informações no navegador. Esses recursos são diferentes dos cookies e podem ter finalidades específicas de funcionamento.",
      "O uso dessas tecnologias pelo ConectaTrampo deve corresponder às funcionalidades realmente presentes no código da aplicação.",
    ],
  },
  {
    title: "4. Cookies necessários",
    paragraphs: [
      "Quando utilizados, cookies estritamente necessários podem viabilizar funcionalidades essenciais ou mecanismos de segurança. A classificação de um cookie depende de sua finalidade e de como é utilizado.",
    ],
  },
  {
    title: "5. Cookies de análise e publicidade",
    paragraphs: [
      "Cookies destinados a publicidade, rastreamento ou análise de comportamento somente devem ser descritos como utilizados quando os respectivos serviços estiverem integrados à plataforma.",
      "Caso sejam implementadas tecnologias que exijam consentimento, o ConectaTrampo deverá fornecer informações claras e disponibilizar os mecanismos de escolha aplicáveis.",
    ],
  },
  {
    title: "6. Como gerenciar cookies?",
    paragraphs: [
      "O usuário pode consultar as configurações do navegador para visualizar, bloquear ou excluir cookies. O bloqueio de determinadas tecnologias pode afetar alguns recursos do site.",
      "Quando aplicável, as escolhas de consentimento deverão ser disponibilizadas de maneira acessível e respeitadas pela plataforma.",
    ],
  },
  {
    title: "7. Serviços de terceiros",
    paragraphs: [
      "Se o ConectaTrampo incorporar ferramentas externas que utilizem cookies ou tecnologias semelhantes, as informações sobre esses serviços deverão ser incluídas nesta política.",
      "Os serviços de terceiros podem possuir suas próprias políticas e práticas de tratamento de dados.",
    ],
  },
  {
    title: "8. Atualizações desta política",
    paragraphs: [
      "Esta política poderá ser atualizada em razão de alterações nas funcionalidades, nas tecnologias utilizadas ou nas exigências legais. A versão vigente estará disponível nesta página.",
    ],
  },
];

export default function CookiesPage() {
  return (
    <main className="legal-page">
      <div className="wrap">
        <header className="site-header">
          <a href="/" className="brand" aria-label="ConectaTrampo - início">
            <span className="brand-mark">CT</span>
            <span>
              Conecta<span className="brand-accent">Trampo</span>
              <small>OPORTUNIDADES E CONEXÕES</small>
            </span>
          </a>

          <nav aria-label="Navegação principal">
            <a href="/">Início</a>
            <a href="/publicar" className="nav-publish">
              Publicar oportunidade
            </a>
          </nav>
        </header>

        <article className="legal-content">
          <a href="/" className="text-link">
            ← Voltar ao ConectaTrampo
          </a>

          <div className="eyebrow" style={{ marginTop: 30 }}>
            <span className="eyebrow-icon">✦</span>
            TRANSPARÊNCIA DIGITAL
          </div>

          <h1>
            Política de <span>Cookies</span>
          </h1>

          <p>
            Saiba como cookies e outras tecnologias de armazenamento podem
            funcionar durante sua navegação no ConectaTrampo.
          </p>

          <p className="legal-updated">
            Última atualização: 22 de outubro de 2026
          </p>

          <div className="legal-alert">
            <strong>Transparência em primeiro lugar.</strong>
            <br />
            Esta política deve refletir as tecnologias efetivamente utilizadas
            pela plataforma. Cookies, armazenamento no navegador e banco de
            dados são mecanismos distintos.
          </div>

          {sections.map((section, index) => (
            <section key={section.title} id={`secao-${index + 1}`}>
              <h2>{section.title}</h2>

              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{paragraph}</p>
              ))}
            </section>
          ))}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 28,
            }}
          >
            <a href="/privacidade" className="button button-secondary">
              Política de Privacidade
            </a>

            <a href="/termos" className="button button-secondary">
              Termos de Uso
            </a>

            <a href="/" className="button button-primary">
              Voltar ao início →
            </a>
          </div>
        </article>

        <footer className="simple-footer">
          <span>© 2026 ConectaTrampo</span>
          <div>
            <a href="/privacidade">Privacidade</a>
            <a href="/cookies">Cookies</a>
            <a href="/termos">Termos de Uso</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
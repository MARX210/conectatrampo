import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | ConectaTrampo",
  description:
    "Conheça as práticas de tratamento e proteção de dados pessoais do ConectaTrampo.",
};

const sections = [
  {
    title: "1. Sobre o ConectaTrampo",
    paragraphs: [
      "O ConectaTrampo é uma plataforma destinada à divulgação e consulta de oportunidades de emprego, trabalho autônomo e serviços freelance.",
      "O responsável pelo tratamento dos dados pessoais deverá ser identificado nesta política, juntamente com um canal válido para contato sobre questões de privacidade.",
    ],
  },
  {
    title: "2. Quais informações podem ser tratadas?",
    paragraphs: [
      "As informações tratadas dependem das funcionalidades utilizadas e dos dados efetivamente enviados à plataforma.",
      "Elas podem incluir informações inseridas em anúncios, como identificação do anunciante, nome da empresa, descrição da oportunidade, localização, remuneração e meios de contato.",
      "Dados técnicos, como endereço IP e registros de acesso, somente devem ser descritos como coletados quando a aplicação ou seus fornecedores efetivamente os registrarem.",
    ],
  },
  {
    title: "3. Informações armazenadas no banco de dados",
    paragraphs: [
      "As informações enviadas pelos usuários podem ser armazenadas em banco de dados para permitir a publicação, consulta, atualização e administração das oportunidades.",
      "Os tipos de dados armazenados dependem dos campos existentes no banco, das rotas da aplicação e das funcionalidades implementadas.",
      "O tratamento deve se limitar às informações necessárias para finalidades legítimas e compatíveis com o funcionamento da plataforma.",
    ],
  },
  {
    title: "4. Finalidades do tratamento",
    paragraphs: [
      "As informações podem ser utilizadas para disponibilizar oportunidades, administrar anúncios, responder a solicitações, investigar denúncias, prevenir fraudes, proteger a plataforma e cumprir obrigações legais.",
      "Os dados não devem ser utilizados para finalidades incompatíveis com aquelas informadas ao titular sem a devida justificativa legal.",
    ],
  },
  {
    title: "5. Informações públicas nos anúncios",
    paragraphs: [
      "As informações inseridas nos anúncios podem ficar visíveis publicamente para que interessados conheçam as oportunidades.",
      "Antes de publicar, o anunciante deve verificar quais informações serão exibidas e evitar incluir documentos pessoais, dados bancários ou informações privadas desnecessárias.",
      "Pedidos relacionados a informações pessoais publicadas indevidamente poderão ser encaminhados ao responsável pela plataforma.",
    ],
  },
  {
    title: "6. Compartilhamento de dados",
    paragraphs: [
      "Os dados poderão ser compartilhados quando necessário para operar a plataforma, utilizar serviços de hospedagem ou banco de dados, atender obrigações legais ou proteger direitos.",
      "Os fornecedores efetivamente utilizados deverão ser identificados conforme a infraestrutura real do ConectaTrampo. O compartilhamento deve se limitar ao necessário para cada finalidade.",
    ],
  },
  {
    title: "7. Links externos",
    paragraphs: [
      "Os anúncios podem conter links para sites, formulários, aplicativos de mensagens e outros serviços externos.",
      "Ao acessar esses serviços, o usuário estará sujeito às políticas dos respectivos responsáveis. O ConectaTrampo não controla necessariamente o tratamento de dados realizado nesses ambientes.",
    ],
  },
  {
    title: "8. Segurança das informações",
    paragraphs: [
      "A proteção dos dados deve ser apoiada por medidas técnicas e administrativas adequadas aos riscos, incluindo controles de acesso, proteção de credenciais e validação das informações recebidas.",
      "Nenhum sistema é absolutamente imune a incidentes. Ocorrências envolvendo dados pessoais deverão ser tratadas conforme as obrigações legais aplicáveis.",
    ],
  },
  {
    title: "9. Retenção e exclusão",
    paragraphs: [
      "As informações devem ser mantidas pelo período necessário para cumprir suas finalidades, obrigações legais e outras hipóteses legítimas de conservação.",
      "O encerramento ou a remoção de um anúncio da listagem pública não significa necessariamente a exclusão imediata de todos os registros do banco de dados.",
      "Os pedidos de exclusão serão analisados conforme os direitos do titular e as hipóteses legais que permitam ou exijam a conservação de informações.",
    ],
  },
  {
    title: "10. Direitos dos titulares",
    paragraphs: [
      "A Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018) prevê direitos que podem incluir confirmação do tratamento, acesso, correção, anonimização, bloqueio, eliminação e informações sobre compartilhamento, conforme as condições legais aplicáveis.",
      "O titular poderá apresentar solicitações ao responsável pelo tratamento, que poderá verificar sua identidade e avaliar eventuais limitações legais.",
    ],
  },
  {
    title: "11. Cookies e armazenamento local",
    paragraphs: [
      "O site poderá utilizar cookies e mecanismos de armazenamento no navegador conforme as funcionalidades efetivamente implementadas.",
      "Para mais informações sobre essas tecnologias, consulte a Política de Cookies.",
    ],
  },
  {
    title: "12. Alterações nesta política",
    paragraphs: [
      "Esta política poderá ser atualizada em razão de mudanças nas funcionalidades, nos fornecedores, nas práticas de tratamento ou nas exigências legais.",
      "A versão vigente será disponibilizada nesta página com a data da última atualização.",
    ],
  },
];

export default function PrivacidadePage() {
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
            PRIVACIDADE E PROTEÇÃO DE DADOS
          </div>

          <h1>
            Política de <span>Privacidade</span>
          </h1>

          <p>
            Entenda como as informações pessoais podem ser tratadas durante
            o uso do ConectaTrampo.
          </p>

          <p className="legal-updated">
            Última atualização: 22 de outubro de 2026
          </p>

          <div className="legal-alert">
            <strong>Seus dados merecem cuidado.</strong>
            <br />
            O tratamento de informações deve ser transparente, limitado a
            finalidades legítimas e realizado conforme a legislação aplicável,
            incluindo a LGPD.
          </div>

          {sections.map((section, index) => (
            <section key={section.title} id={`secao-${index + 1}`}>
              <h2>{section.title}</h2>

              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{paragraph}</p>
              ))}
            </section>
          ))}

          <div className="legal-alert">
            <strong>Contato sobre dados pessoais</strong>
            <br />
            Antes de publicar esta política como versão definitiva, informe
            os dados do responsável pelo tratamento e disponibilize um canal
            oficial para solicitações de privacidade.
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 28,
            }}
          >
            <a href="/cookies" className="button button-secondary">
              Política de Cookies
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
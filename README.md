# ConectaTrampo

**Conectando pessoas a oportunidades de trabalho.**

O ConectaTrampo é uma plataforma digital destinada à divulgação e à consulta de oportunidades profissionais, incluindo vagas de emprego e trabalhos freelance.

A proposta é facilitar a conexão entre quem oferece uma oportunidade e quem procura trabalho, tornando as informações mais acessíveis e organizadas.

## Objetivos

- Facilitar a descoberta de oportunidades profissionais.
- Permitir a divulgação de vagas por empresas e pessoas.
- Reunir oportunidades de emprego e trabalhos freelance.
- Disponibilizar informações sobre requisitos, localização e modalidade de trabalho.
- Direcionar os interessados aos canais de candidatura ou contato indicados pelo publicador.

## Funcionalidades

As funcionalidades previstas ou implementadas devem ser identificadas conforme a versão atual da aplicação:

- Listagem de oportunidades.
- Consulta aos detalhes de cada oportunidade.
- Publicação de oportunidades.
- Cadastro de informações sobre a empresa ou o responsável pela publicação.
- Inclusão de links externos para candidatura ou contato.
- Edição e gerenciamento das próprias publicações.
- Encerramento e reativação de oportunidades.
- Exclusão de publicações.
- Denúncia de oportunidades suspeitas ou inadequadas.
- Validação dos dados enviados.
- Armazenamento persistente das oportunidades em banco de dados.

## Tecnologias

A base do projeto utiliza tecnologias do ecossistema web, incluindo:

- Next.js
- React
- TypeScript
- Tailwind CSS

O banco de dados, o mecanismo de acesso aos dados e os serviços de hospedagem devem ser identificados conforme a configuração efetiva do projeto.

## Execução local

1. Instale o Node.js em uma versão compatível com o projeto.
2. Clone o repositório.
3. Instale as dependências.
4. Configure as variáveis de ambiente necessárias.
5. Execute as migrações do banco de dados, quando aplicável.
6. Inicie o servidor de desenvolvimento.

Os comandos exatos devem seguir os scripts definidos no arquivo `package.json`.

## Configuração

Credenciais, URLs privadas e chaves de serviços devem ser armazenadas em variáveis de ambiente.

Não publique senhas, tokens privados ou credenciais do banco de dados no repositório.

O arquivo `.env.example` deve apresentar somente os nomes das variáveis necessárias, sem valores secretos.

## Banco de dados

As oportunidades devem ser armazenadas no banco de dados configurado pela aplicação.

A estrutura das tabelas, os relacionamentos, as regras de validação e os procedimentos de migração estão descritos em `docs/BANCO_DE_DADOS.md`, quando esse documento estiver disponível.

## Privacidade e segurança

A plataforma deve tratar os dados pessoais de acordo com sua finalidade e observar a legislação aplicável, incluindo a Lei Geral de Proteção de Dados Pessoais (LGPD).

As informações sobre coleta, armazenamento, compartilhamento e exclusão de dados devem refletir o funcionamento real da aplicação.

## Contribuição

Alterações devem preservar a integridade dos dados, a segurança das publicações e a consistência entre o código, o banco de dados e a documentação.

Consulte `CONTRIBUTING.md` para orientações de desenvolvimento, caso esse arquivo esteja disponível.

## Status do projeto

O ConectaTrampo está em desenvolvimento contínuo. As funcionalidades disponíveis devem ser confirmadas na versão publicada da aplicação.
---
title: "Construindo um site com Astro e publicando no GitHub Pages com GitHub Actions"
description: "Um guia prático para criar um site com o template de blog do Astro e automatizar sua publicação no GitHub Pages."
pubDate: 2026-09-15
tags:
  - Astro
  - GitHub Pages
  - GitHub Actions
  - JavaScript
draft: false
---

## Introdução

Lembro que no começo da minha carreira criar um site não era uma atividade complexa, mas era muito trabalhosa. Construir todo o HTML e CSS, além de validar o site em diferentes browsers, demandava bastante tempo.
Quando falávamos em blogs, na maioria das vezes escolhíamos alguma ferramenta de mercado, como o Blogger, que já entregava toda a estrutura necessária.
Hoje, ferramentas como o Astro e o GitHub Pages tornam esse processo muito mais simples. Podemos criar o nosso próprio site com poucos comandos, além de ser possível escolher um template específico para blogs, não dependendo mais de soluções externas.

Neste artigo, vou mostrar, passo a passo, como criar um site utilizando o template de blog do Astro, colocá-lo em um repositório do GitHub e configurar uma rotina de publicação automática utilizando GitHub Actions. Bastará executar um push na branch main e o nosso site estará publicado.

O objetivo é partir de um projeto recém-criado e chegar a um site publicado e acessível pela internet, com o processo de build e deploy automatizado.

---

## Criando o projeto

### Pré-requisitos

Antes de criar o projeto, precisamos ter o Node.js e o Git instalados. Neste artigo, vamos utilizar o NVM para gerenciar as versões do Node.js.

Antes de instalar qualquer coisa, podemos verificar se o Node.js, o NVM e o Git já estão disponíveis no ambiente.

Verificamos a instalação do Node.js:
```bash
node --version
```

Verificamos a instalação do NVM.
```bash
nvm --version
```

Também será necessário ter o Git instalado e uma conta no GitHub para as etapas de versionamento e publicação.

Para verificar se o Git está disponível no ambiente:
```bash
git --version
```

### Instalando os pré-requisitos

Caso algum dos pré-requisitos não esteja instalado, podemos fazer a instalação antes de continuar.

Eu estou utilizando um MacBook e o Homebrew para fazer as instalações. Portanto, os comandos apresentados neste artigo consideram esse ambiente, mas podem ser adaptados para outros sistemas operacionais.

Primeiro, vamos instalar o NVM, que nos permitirá alternar entre versões do Node sem gerar conflitos em projetos diferentes. Por exemplo:
```text
Projeto A → Node 20
Projeto B → Node 22
Projeto C → Node 24
```

Para instalar o NVM:
```bash
brew install nvm
```

Eu utilizo o Z shell (zsh) para interpretar comandos no meu Terminal. Então, é necessário realizar a configuração para que ele interprete adequadamente os comandos do NVM. Esses passos não são necessários em ambientes que não utilizam o Z shell e podem ser desconsiderados.
O primeiro passo é criar o diretório do NVM:
```bash
mkdir -p ~/.nvm
```

No meu caso, utilizando um MacBook com Apple Silicon, o caminho do Homebrew é `/opt/homebrew/opt/nvm/`. Antes de executar o próximo comando, é necessário conferir o caminho que está em sua máquina e alterá-lo adequadamente.

Adicionamos o NVM ao arquivo `.zshrc`, executando esse comando inteiro:
```bash
cat <<'EOF' >> ~/.zshrc

# NVM
export NVM_DIR="$HOME/.nvm"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"
[ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && \. "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"
EOF
```

Recarregamos a configuração:
```bash
source ~/.zshrc
```

Validamos se a instalação do NVM ocorreu com sucesso e se a configuração do zsh está correta:
```bash
nvm --version
```

Deve retornar algo como (versão do NVM):
```text
0.40.7
```

Se tudo ocorreu como esperado, podemos iniciar agora a instalação do Node.js.
Para o projeto do Astro, vamos utilizar a versão LTS do Node. LTS é a sigla para Long-Term Support (Suporte de Longo Prazo), indicando uma versão que recebe suporte e atualizações de segurança por um período prolongado.

Executamos:
```bash
nvm install --lts
```

Ao executar o comando, o NVM irá:
1. baixar a versão LTS do Node;
2. instalar dentro do seu ~/.nvm;
3. disponibilizar node e npm;
4. normalmente selecionar essa versão para a sessão atual.

Depois, conferimos executando os dois comandos:
```bash
node --version
npm --version
```

Os comandos devem retornar algo semelhante a:
```text
v24.x.x
11.x.x
```
Os números exatos podem ser diferentes conforme a versão LTS vigente.

Com as instalações confirmadas, vamos tornar a versão LTS como padrão:
```bash
nvm alias default "lts/*"
```
Ao abrir um novo Terminal, o NVM poderá selecionar automaticamente essa versão LTS.

Acabamos de montar uma cadeia pequena de ferramentas que será útil para qualquer projeto Node que você fizer daqui para frente:
```text
macOS
  │
  ├── Homebrew
  │      └── instala ferramentas
  │
  └── NVM
         └── gerencia versões do Node
                │
                ├── node
                └── npm
                       │
                       └── Astro
```
Agora, estamos prontos para iniciar a configuração do blog através do Astro.

### Criando o projeto com o template de blog

Com o ambiente preparado, podemos criar um novo projeto Astro utilizando o comando:
```bash
npm create astro@latest
```

O Astro inicia um assistente interativo para configurar o novo projeto.

Entre as opções disponíveis estão diferentes tipos de projeto, incluindo um projeto inicial básico, um template de blog, um template de documentação baseado no Starlight e um projeto mínimo. Em algum momento, ele solicitará que escolhamos o tipo de projeto, apresentando algo como:
```text
How would you like to start your new project?
         ○ A basic, helpful starter project (recommended)
         ● Use blog template 
         ○ Use docs (Starlight) template 
         ○ Use minimal (empty) template
``` 

Nossa escolha será o **Use blog template**, pois ele já fornece uma estrutura inicial adequada para um site baseado em conteúdo.

Em seguida, o assistente perguntará se deve instalar as dependências. Para o passo a passo deste artigo, escolha **não**:
```text
Install dependencies? (recommended)
         ○ Yes  ● No 
```

Em seguida, o assistente perguntará se deve inicializar um novo repositório Git. Também escolha **não**. Faremos isso mais adiante:
```text
Initialize a new git repository? (optional)
         ○ Yes  ● No 
```

Ao concluir o assistente, entramos no diretório que escolhemos para o projeto. No meu caso, criei o diretório chamado `blog`. Então:
```bash
cd blog
```

Como optamos por não instalar as dependências através do assistente, precisamos instalá-las executando o comando explicitamente:
```bash
npm install
```

### Executando o projeto localmente

O Astro fornece alguns comandos através do `package.json`.

Podemos visualizar os scripts disponíveis com:
```bash
npm run
```

Entre os principais comandos estão:
- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: gera o build de produção.
- `npm run preview`: executa localmente o build de produção.
- `npm run astro`: disponibiliza a CLI do Astro.

Vale destacar que os scripts disponíveis podem variar conforme o template e as configurações do projeto.

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O Astro disponibilizará o site normalmente em: [http://localhost:4321/](http://localhost:4321/).

Ao acessar esse endereço no navegador, podemos visualizar o projeto funcionando localmente.

O fluxo nesse momento é simples:

```text
Código Astro
     ↓
npm run dev
     ↓
Servidor de desenvolvimento do Astro
     ↓
localhost:4321
     ↓
Navegador
```

---

## Conhecendo o projeto inicial

### Estrutura de diretórios

Depois de criar o projeto, vale a pena conhecer sua estrutura antes de começar a modificá-lo. Utilizamos a seguinte instrução:
```bash
ls -la
```

A estrutura será semelhante à apresentada a seguir e pode variar conforme a versão do Astro e as opções escolhidas no assistente:
```text
blog/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── content/
│   │   └── blog/
│   ├── layouts/
│   ├── pages/
│   └── styles/
├── .gitignore
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

Algumas das pastas mais importantes são:

- `src/pages/`: contém as páginas e rotas do site.
- `src/components/`: componentes reutilizáveis.
- `src/layouts/`: layouts utilizados pelas páginas.
- `src/content/`: conteúdo organizado em coleções.
- `src/assets/`: arquivos que podem ser processados pelo Astro, como imagens.
- `public/`: arquivos estáticos que serão disponibilizados diretamente.
- `astro.config.mjs`: configuração principal do Astro.

Uma das vantagens de começar com o template de blog é que boa parte da estrutura necessária para um site de conteúdo já está pronta.

O projeto já possui componentes para elementos comuns do site, layouts para as páginas, configuração para conteúdo em Markdown/MDX e recursos relacionados à publicação.

Vale destacar também que existem diversos templates do Astro, gratuitos e pagos, que podem ser encontrados na internet e utilizados como ponto de partida. Não é necessário limitar a personalização do layout a esse template.

O arquivo `package.json` também define alguns scripts básicos:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  }
}
```

---

## Preparando o projeto para o GitHub

### Criando o repositório

Durante a criação do projeto Astro, optamos por não inicializar um novo repositório para o projeto. Logo, precisamos fazer isso manualmente. Para isso, execute o comando:
```bash
git init
```

Para utilizar o GitHub Pages como um **site pessoal**, o nome do repositório segue uma convenção específica:
```text
<seu-usuario>.github.io
```

No meu caso, por exemplo, o repositório é:
```text
dougcosta.github.io
```

Crie no GitHub um novo repositório vazio para o projeto, sem adicionar um README, .gitignore ou outros arquivos iniciais, uma vez que o projeto já existe localmente. Depois conecte o diretório a ele (se atente para utilizar as configurações específicas do seu diretório):
```bash
git branch -M main
git remote add origin https://github.com/<seu-usuario>/<seu-usuario>.github.io.git
```

Como estamos utilizando npm, o `package-lock.json` também deve ser versionado. Ele registra as versões das dependências utilizadas pelo projeto e permite que a instalação seja reproduzida de forma mais consistente. É utilizado pela action do Astro durante o processo de build. Portanto, garanta que ele não esteja dentro do arquivo `.gitignore`.


### Configurando o endereço do site no Astro

O Astro precisa conhecer a URL pública do site.

Essa configuração é feita no arquivo **`astro.config.mjs`** que fica na raiz do projeto.

A propriedade `site` deve receber a URL pública. No meu caso será [https://dougcosta.github.io](https://dougcosta.github.io), altere considerando aquela que você definiu:
```js
export default defineConfig({
  site: 'https://dougcosta.github.io',
});
```

A propriedade `site` é utilizada pelo Astro para gerar URLs absolutas quando necessário.

Como o repositório segue a convenção de um site pessoal do GitHub Pages, o site será publicado diretamente na raiz do domínio:
```text
https://dougcosta.github.io/
```

---

## Publicando no GitHub Pages

### Configurando o GitHub Actions

Até aqui, conseguimos executar o projeto localmente e preparar o repositório para o versionamento e a publicação automática.

O GitHub Pages pode hospedar o resultado estático gerado pelo Astro, enquanto o GitHub Actions pode executar automaticamente o processo de build e deploy.

Para isso, é necessário criar o arquivo **`.github/workflows/deploy.yml`** manualmente e incluir o conteúdo a seguir, que configura um workflow básico para esse projeto:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v6

      - name: Install, build, and upload site
        uses: withastro/action@v6

  deploy:
    needs: build
    runs-on: ubuntu-latest

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

O workflow é executado automaticamente sempre que ocorre um `push` na branch `main`.

Também existe a opção `workflow_dispatch`, que permite iniciar o workflow manualmente pela interface do GitHub.

A action do Astro instala as dependências, executa o build e faz o upload do artefato.

Primeiro, o job `build`:

```text
Checkout do código
       ↓
Instalação das dependências
       ↓
Build do Astro
       ↓
Upload do artefato
```

Depois, o job `deploy` utiliza o artefato gerado para publicá-lo no GitHub Pages.

### Configurando o GitHub Pages

No GitHub, entramos no repositório do projeto e acessamos:
```text
Settings → Pages
```

Em `Build and deployment`, selecionamos `GitHub Actions` como fonte da publicação.

### Fazendo o primeiro push

Antes de enviar as alterações para a `main`, é uma boa prática validarmos localmente o build de produção.

```bash
npm run build
```

Se o build for concluído sem erros, podemos enviar o código para o GitHub.

Depois do push para a branch `main`, o GitHub Actions detectará a alteração e iniciará automaticamente o workflow.

Adicionamos os arquivos ao controle de versão:
```bash
git add .
```

Criamos o primeiro commit:
```bash
git commit -m "Initial commit"
```

Subimos as alterações ao servidor:
```bash
git push -u origin main
```

### O processo de build e deploy

A partir desse momento, o processo de publicação deixa de depender de uma execução manual.

Sempre que houver um novo `push` na branch `main`:

```text
git push
    ↓
GitHub
    ↓
GitHub Actions
    ↓
Build do Astro
    ↓
Artefato do site
    ↓
GitHub Pages
    ↓
Site atualizado
```

Isso significa que, depois da configuração inicial, publicar uma alteração no site passa a ser praticamente uma consequência natural do fluxo de desenvolvimento.

Ao final desse processo, temos um site Astro publicado no GitHub Pages e um processo automatizado de build e deploy.

O código permanece versionado no GitHub e cada alteração enviada para a branch `main` gera uma nova versão em produção, publicada automaticamente.

---

## Conclusão

Criar e publicar um site utilizando Astro e GitHub Pages é um processo muito simples. Grande parte dos passos descritos aqui está relacionada à preparação do ambiente e à instalação dos pré-requisitos. Foram necessários apenas alguns comandos para que o Astro rodasse localmente.

A partir de um template pronto, versionamos o código e configuramos uma rotina de build e deploy utilizando GitHub Actions, resultando em um site estático com um processo de publicação automatizado e sem a necessidade de manter um servidor próprio.

Para quem começou a trabalhar com desenvolvimento de software há duas décadas, a diferença é especialmente interessante. No início da minha carreira, colocar um site no ar envolvia muito mais etapas de configuração, infraestrutura e publicação. Hoje, é possível sair de um diretório vazio para um site publicado e automatizado em relativamente poucos passos. Acho que essa simplicidade é algo muito interessante no desenvolvimento web moderno.

## Referências

As documentações oficiais utilizadas como referência para este artigo são:

- [Astro — Instalação e configuração](https://docs.astro.build/pt-br/install-and-setup/)
- [Astro — Publicando no GitHub Pages](https://v6.docs.astro.build/en/guides/deploy/github/)
- [Node.js — Download e instalação](https://nodejs.org/pt-br/download)
- [GitHub Docs — Criando um repositório](https://docs.github.com/en/repositories/creating-and-managing-repositories/quickstart-for-repositories)
- [GitHub Docs — Criando um site com GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [GitHub Docs — GitHub Pages: início rápido](https://docs.github.com/en/pages/quickstart)
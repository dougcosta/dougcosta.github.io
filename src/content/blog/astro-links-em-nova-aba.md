---
title: "Fazendo links externos dos posts abrirem em uma nova aba no Astro"
description: "Como criar e configurar um plugin com Sätteri para fazer links externos dos posts Markdown abrirem automaticamente em uma nova aba."
pubDate: 2026-09-17
lang: pt-BR
translationKey: astro-external-links
tags:
  - Astro
  - Markdown
  - Sätteri
  - JavaScript
draft: false
---

## Introdução

Ao criar um site ou escrever artigos, é muito comum utilizar links externos para informações complementares, referências, repositórios de código ou outros conteúdos.

Quando o leitor acessa um desses links, normalmente queremos que ele continue com o conteúdo principal aberto. Por isso, é comum abrir esses links em uma nova aba ou janela do navegador.

Fui surpreendido ao descobrir que o Astro não abre esses links em uma nova aba por padrão. Os links continuam sendo abertos na mesma aba, independentemente de utilizarmos o Markdown ou a própria tag de âncora do HTML (`<a href="...">`) diretamente. 

O problema é que o Markdown não possui uma sintaxe própria para definir atributos HTML como `target="_blank"`. A sintaxe tradicional continua sendo algo como:

```markdown
[Documentação do Astro](https://docs.astro.build/)
```

Para resolver isso de forma automática, podemos utilizar um plugin que modifica os links gerados pelo Markdown antes que eles sejam transformados em HTML.

Neste artigo, vamos criar esse plugin utilizando **Sätteri**, o processador de Markdown que estamos utilizando no projeto para esse tipo de extensão.

## O que queremos fazer

A ideia é simples. Sempre que o `href` de um link começar com `http://` ou `https://`, queremos que o HTML gerado pelo Astro seja semelhante a:

```html
<a href="https://docs.astro.build/" target="_blank" rel="noopener noreferrer">
  Documentação do Astro
</a>
```

Não queremos precisar adicionar atributos manualmente em cada link. O plugin será responsável por fazer essa alteração automaticamente.

Links internos do próprio site, por outro lado, não devem ser alterados.

## Instalando o Sätteri

O Astro possui suporte ao processador Sätteri por meio do pacote `@astrojs/markdown-satteri`. Para criar o nosso plugin, também utilizaremos o pacote `satteri`.

Execute:

```bash
npm install @astrojs/markdown-satteri satteri
```

O `@astrojs/markdown-satteri` permite utilizar o Sätteri como processador de Markdown no Astro, enquanto o pacote `satteri` fornece as APIs utilizadas para criar plugins personalizados.

A documentação do Astro também apresenta o Sätteri como uma opção para criar plugins que modificam elementos HTML gerados a partir do Markdown.

## Criando o plugin

Agora vamos criar um arquivo para o nosso plugin.

No meu projeto, organizei os plugins dentro de `src/plugins`. Então, crie:

```text
src/plugins/external-links.ts
```

O conteúdo do arquivo será:

```ts
import { defineHastPlugin } from 'satteri';

export const externalLinks = defineHastPlugin({
	name: 'external-links',
	element: {
		filter: ['a'],
		visit(node, ctx) {
			const href = node.properties?.href;

			if (typeof href === 'string' && /^https?:\/\//.test(href)) {
				ctx.setProperty(node, 'target', '_blank');
				ctx.setProperty(node, 'rel', ['noopener', 'noreferrer']);
			}
		},
	},
});
```

Vamos entender o que está acontecendo.

### Identificando os links

O plugin utiliza `defineHastPlugin` para definir um plugin HAST.

HAST é uma representação em árvore do HTML. Isso significa que, nesse estágio do processamento, conseguimos trabalhar com os elementos HTML que serão gerados a partir do Markdown.

No nosso caso, estamos interessados apenas nos elementos `<a>`:

```ts
element: {
	filter: ['a'],
```

O `visit` será executado para esses elementos.

### Verificando se o link é externo

Dentro do `visit`, primeiro recuperamos o endereço do link:

```ts
const href = node.properties?.href;
```

Depois verificamos se ele começa com `http://` ou `https://`:

```ts
if (typeof href === 'string' && /^https?:\/\//.test(href)) {
```

Essa verificação é importante porque queremos modificar apenas links externos.

Por exemplo:

```text
https://docs.astro.build/
https://github.com/
http://example.com/
```

Links internos como:

```text
/blog/
```

não passam por essa condição e permanecem com o comportamento normal do site.

### Adicionando o target

Quando encontramos um link externo, adicionamos:

```ts
ctx.setProperty(node, 'target', '_blank');
```

Isso faz com que o HTML resultante utilize:

```html
target="_blank"
```

Assim, o navegador abrirá o endereço em uma nova aba.

### Adicionando o rel

Também adicionamos:

```ts
ctx.setProperty(node, 'rel', ['noopener', 'noreferrer']);
```

O resultado será equivalente a:

```html
rel="noopener noreferrer"
```

Além de ser uma configuração recomendada para links que utilizam `target="_blank"`, `noopener` impede que a página aberta tenha acesso à janela que originou a navegação. Já `noreferrer` também impede o envio da informação de referência (`Referer`) para a página de destino.

Dessa forma, abrir em uma aba separada passa a ser o comportamento padrão para os links com URLs `http://` ou `https://` presentes no conteúdo Markdown.

Caso queira adicionar outros atributos como padrão, basta seguir a mesma lógica e incluí-los aqui.

## Configurando o Astro

Agora precisamos informar ao Astro que queremos utilizar o nosso plugin durante o processamento dos arquivos Markdown.

Abra o arquivo abaixo, que fica na raiz do projeto:

```text
astro.config.mjs
```

Primeiro, importe o `satteri` e o plugin que acabamos de criar:

```js
import { satteri } from '@astrojs/markdown-satteri';
import { externalLinks } from './src/plugins/external-links';
```

Depois, configure o processador dentro de `markdown`:

```js
markdown: {
	processor: satteri({
		hastPlugins: [externalLinks],
	}),
},
```

No meu projeto, a configuração ficou assim:

```js
// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { externalLinks } from './src/plugins/external-links';

export default defineConfig({
	site: 'https://dougcosta.com',
	integrations: [mdx(), sitemap()],
	markdown: {
		processor: satteri({
			hastPlugins: [externalLinks],
		}),
	},
});
```

## Testando o plugin

Agora podemos testar o comportamento.

Adicione um link externo a um post Markdown:

```markdown
[Documentação do Astro](https://docs.astro.build/)
```

Depois execute o projeto localmente:

```bash
npm run dev
```

Abra o post no navegador e clique no link. Ele deverá ser aberto em uma nova aba ou janela, dependendo do navegador e das suas configurações.

Também podemos verificar o HTML gerado pelo navegador. Clique com o botão direito na página e escolha a opção correspondente a `Inspecionar` (essa opção pode variar de acordo com o navegador utilizado).

O link deverá conter:

```html
target="_blank"
```

e:

```html
rel="noopener noreferrer"
```

## Um detalhe importante: cuidado com `draft: true`

Durante esse processo, encontrei um detalhe que pode facilmente levar a uma conclusão errada durante os testes.

No meu projeto, posts marcados como:

```yaml
draft: true
```

não são incluídos no build de produção.

Isso significa que, se você testar o plugin executando o comando abaixo e o post estiver marcado como `draft: true`, o arquivo HTML desse post não será gerado:

```bash
npm run build
```

Nesse caso, procurar por `target="_blank"` no diretório `dist` não permitirá verificar o funcionamento do plugin, porque o próprio post não estará presente no build. Portanto, não haverá um arquivo HTML desse post para inspecionar.

Portanto, **antes de testar o plugin em um build de produção, garanta que o post utilizado no teste não esteja com `draft: true`**.

Para um post que deve participar do build, o frontmatter deve estar, por exemplo, assim:

```yaml
---
title: "Meu post"
description: "Descrição do post."
pubDate: 2026-09-16
draft: false
---
```

Esse detalhe parece pequeno, mas foi justamente o que inicialmente dificultou a validação do plugin no meu projeto.

## Por que fazer isso com um plugin?

Uma alternativa seria controlar `target="_blank"` individualmente em cada componente ou alterar manualmente os links depois que o Markdown fosse renderizado.

Isso, porém, criaria uma responsabilidade adicional para cada novo post.

Com o plugin, a regra fica centralizada:

```text
Post Markdown
     ↓
Sätteri
     ↓
Plugin external-links
     ↓
Identifica links externos
     ↓
Adiciona target="_blank"
     ↓
HTML final
```

A partir daí, qualquer novo link externo criado em um post passa pelo mesmo processamento automaticamente.

Isso também significa que não precisamos lembrar de adicionar atributos específicos sempre que criarmos um link para uma documentação ou outro site.

## Conclusão

No meu ponto de vista, é surpreendente que o Markdown não possua uma sintaxe própria para controlar atributos HTML como `target`. Entendo que esse tipo de comportamento é bastante comum na construção de um site e que seria interessante poder configurá-lo de forma mais direta.
A solução que encontrei foi utilizar um plugin, como descrito neste artigo, mas também seria possível controlar esse comportamento individualmente em cada componente ou utilizar outra abordagem.

A solução acabou sendo relativamente simples. Utilizar o Sätteri para interceptar os elementos `<a>` gerados pelo Markdown e adicionar os atributos necessários aos links. Apesar disso, foi necessária uma pesquisa mais detalhada para chegar a essa alternativa.

O importante foi perceber que esse tipo de comportamento pode ser centralizado em um plugin. Em vez de adaptar cada post individualmente, criamos uma regra que passa a valer para todo o conteúdo Markdown do site.

Outro aprendizado importante está nos testes. Quando trabalhamos com posts que possuem `draft: true`, precisamos lembrar que eles não participam do build de produção. Caso contrário, podemos interpretar a ausência do conteúdo gerado como um problema no plugin, quando na verdade o post simplesmente não foi publicado no build.

## Links úteis

Se você ainda não possui um site e quer criar um utilizando Astro, veja também o artigo:

- [Construindo um site com Astro e publicando no GitHub Pages com GitHub Actions](../construindo-site-astro-github-pages/)

Nele, mostro o processo de criação de um projeto Astro a partir do template de blog e a configuração da publicação automática no GitHub Pages utilizando GitHub Actions.

## Referências

As documentações utilizadas como referência para este artigo são:

- [Astro — Add icons to external links](https://docs.astro.build/en/recipes/external-links/)
- [Astro — Markdown in Astro](https://docs.astro.build/en/guides/markdown-content/)

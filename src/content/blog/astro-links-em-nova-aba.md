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

É muito comum utilizar links externos em sites ou artigos. Pode ser links para informações complementares, referências, repositórios de código ou outros conteúdos externos.

A boa prática é que esses links sejam abertos em uma nova aba ou janela do Browser. Dessa forma, o leitor continua na página do conteúdo principal, sem que ele desvie a sua atenção ou se perca.

Fui supreendido ao descobrir que o Astro não suporta esse recurso por padrão, abrindo os links na mesma aba e tirando o leitor do site principal, independetemente se utilizamos o próprio Markdown ou mesmo a tag de ancora do html (a href) diretamente. 

O problema é que o Markdown não possui uma sintaxe própria para definir atributos HTML como `target="_blank"`. A sintaxe tradicional continua sendo algo como:

```markdown
[Documentação do Astro](https://docs.astro.build/)
```

Para resolver isso de forma automática, podemos utilizar um plugin que modifica os links gerados pelo Markdown antes que eles sejam transformados em HTML.

Neste artigo, vamos criar esse plugin utilizando **Sätteri**, o processador de Markdown utilizado pelo Astro para esse tipo de extensão.

## O que queremos fazer

A ideia é simples. Sempre que um link de um post apontar para uma URL externa, queremos que o HTML gerado pelo Astro seja semelhante a:

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

Além de ser uma configuração recomendada para links que utilizam `target="_blank"`, ela evita que a página aberta tenha acesso desnecessário à janela que originou a navegação.

Dessa forma, abrir em uma aba separada passa a ser o comportamento padrão para **todos** os links externos.

Caso deseje que mais algum outro atributo seja padrão, basta seguir a mesma lógica e adicioná-lo aqui.

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
	site: 'https://dougcosta.github.io',
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

Abra o post no navegador e clique no link. Ele deverá ser aberto em uma nova aba.

Também podemos verificar o HTML gerado pelo navegador. Clique com o botão direito na página e escolha a opção correspondete a `inspeção de código` (essa opção pode variar de acordo com o Browser utilizado).

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

Isso significa que, se você testar o plugin executando:

```bash
npm run build
```

e o post estiver marcado como `draft: true`, o arquivo HTML desse post não será gerado.

Nesse caso, procurar por `target="_blank"` no diretório `dist` não permitirá verificar o funcionamento do plugin, porque o próprio post não estará presente no build. Nesse caso, o link não será aberto em uma nova aba ou janela.

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

Isso também significa que não precisamos lembrar de adicionar algum atributo especial sempre que criarmos uma referência para uma documentação ou outro site.

## Conclusão

No meu ponto de vista, é supreendente que não haja no Markdown uma sintaxe própria para controlar atributos HTML como `target` por padrão. Entendo que é algo basico na construção de um site e não deveria exigir a implementação adicional, seja através de plugin como descrito nesse artigo, controlando individualmente cada componente ou aplicado alguma outra manobra.

A solução acabou sendo relativamente simples: utilizar o Sätteri para interceptar os elementos `<a>` gerados pelo Markdown e adicionar os atributos necessários aos links externos, apesar de demandar uma pesquisa mais detalhada para chegar nessa alternativa.

O importante foi perceber que esse tipo de comportamento pode ser centralizado em um plugin. Em vez de adaptar cada post individualmente, criamos uma regra que passa a valer para todo o conteúdo Markdown do site.

Também fica um aprendizado importante para os testes: quando trabalhamos com posts que possuem `draft: true`, precisamos lembrar que eles não participam do build de produção. Caso contrário, podemos interpretar a ausência do conteúdo gerado como um problema no plugin, quando na verdade o post simplesmente não foi publicado no build.

## Links úteis

Se você ainda não possui um site e quer criar um utilizando Astro, veja também o artigo:

- [Construindo um site com Astro e publicando no GitHub Pages com GitHub Actions](./construindo-site-astro-github-pages/)

Nesse artigo, mostro o processo de criação de um projeto Astro a partir do template de blog e a configuração da publicação automática no GitHub Pages utilizando GitHub Actions.

## Referências

As documentações utilizadas como referência para este artigo são:

- [Astro — Add icons to external links](https://docs.astro.build/en/recipes/external-links/)
- [Astro — Markdown in Astro](https://docs.astro.build/en/guides/markdown-content/)

---
title: "Internacionalizando um site Astro com múltiplos idiomas"
description: "Como adicionar suporte a múltiplos idiomas em um site Astro, organizando traduções, rotas, conteúdo e navegação."
lang: pt-BR
translationKey: multilanguage-astro
pubDate: 2026-09-16
tags:
  - Astro
  - i18n
  - JavaScript
  - Web
draft: false
---

## Introdução

Quando um site começa a crescer, oferecer o conteúdo em mais de um idioma pode ser uma evolução natural.

No meu caso, eu queria que o site tivesse suporte a quatro idiomas:

- Português do Brasil;
- Inglês;
- Francês;
- Espanhol.

Além de traduzir os textos da interface, era importante que o blog também fosse internacionalizado. Isso significa que cada artigo poderia possuir versões traduzidas, cada uma com sua própria URL.

Neste artigo, vou mostrar como implementei essa estrutura no meu site utilizando os recursos de internacionalização do Astro.

A ideia foi manter uma única aplicação, mas permitir que cada idioma tivesse suas próprias páginas, traduções e artigos.

## O que queremos construir

Antes de começar, vale definir como queremos que as URLs funcionem.

O português será o idioma padrão do site e, por isso, não terá um prefixo na URL:

```text
https://dougcosta.github.io/
https://dougcosta.github.io/blog/
```

Para os demais idiomas, utilizaremos um prefixo:

```text
https://dougcosta.github.io/en/
https://dougcosta.github.io/en/blog/

https://dougcosta.github.io/fr/
https://dougcosta.github.io/fr/blog/

https://dougcosta.github.io/es/
https://dougcosta.github.io/es/blog/
```

O mesmo princípio será utilizado para os artigos.

Por exemplo, um mesmo artigo pode possuir as seguintes URLs:

```text
/blog/construindo-site-astro-github-pages/
/en/blog/building-a-site-with-astro-github-pages/
/fr/blog/creer-un-site-avec-astro-et-github-pages/
/es/blog/crear-un-sitio-con-astro-y-github-pages/
```

Isso nos permite ter URLs próprias para cada idioma, em vez de tentar colocar todas as traduções dentro da mesma página.

## Configurando a internacionalização no Astro

O primeiro passo é informar ao Astro quais idiomas serão suportados.

Essa configuração fica no arquivo:

```text
astro.config.mjs
```

No meu projeto, a configuração ficou assim:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://dougcosta.github.io',

	i18n: {
		defaultLocale: 'pt-BR',
		locales: ['pt-BR', 'en', 'fr', 'es'],
		routing: {
			prefixDefaultLocale: false,
		},
	},
});
```

A propriedade `defaultLocale` define o idioma padrão do site.

Neste caso:

```text
pt-BR
```

Já o array `locales` lista todos os idiomas disponíveis.

A configuração:

```js
prefixDefaultLocale: false
```

é importante para o comportamento que queremos.

Ela significa que o idioma padrão não terá um prefixo na URL.

Assim:

```text
/
```

representa o português, enquanto:

```text
/en/
/fr/
/es/
```

representam os outros idiomas.

## Criando os arquivos de tradução

Além do roteamento, precisamos traduzir os textos que fazem parte da interface do site.

Para isso, criei uma estrutura específica dentro de `src`:

```text
src/
└── i18n/
    ├── en.ts
    ├── es.ts
    ├── fr.ts
    ├── pt-BR.ts
    ├── index.ts
    └── utils.ts
```

Cada arquivo de idioma contém as traduções correspondentes.

Por exemplo, o arquivo `pt-BR.ts` possui textos como:

```ts
export default {
	nav: {
		home: 'Início',
		blog: 'Blog',
		about: 'Sobre',
	},

	home: {
		readBlog: 'Ver blog',
		allPosts: 'Ver todos os textos',
		latestPosts: 'Últimos textos',
	},
};
```

O arquivo em inglês possui a mesma estrutura, mas com os textos traduzidos:

```ts
export default {
	nav: {
		home: 'Home',
		blog: 'Blog',
		about: 'About',
	},

	home: {
		readBlog: 'Read blog',
		allPosts: 'View all posts',
		latestPosts: 'Latest posts',
	},
};
```

A vantagem dessa abordagem é que os componentes podem utilizar a mesma estrutura independentemente do idioma atual.

## Centralizando os idiomas

Depois de criar os arquivos individuais, precisamos disponibilizar as traduções de uma forma centralizada.

Para isso, criei:

```text
src/i18n/index.ts
```

O arquivo importa todos os catálogos:

```ts
import ptBR from './pt-BR';
import en from './en';
import fr from './fr';
import es from './es';

const translations = {
	'pt-BR': ptBR,
	en,
	fr,
	es,
};

export type Locale = keyof typeof translations;
export type Translations = typeof ptBR;

const typedTranslations: Record<Locale, Translations> = {
	'pt-BR': ptBR,
	en,
	fr,
	es,
};

export function getTranslations(locale: Locale): Translations {
	return typedTranslations[locale];
}
```

Com isso, um componente pode simplesmente obter as traduções do idioma atual:

```ts
const t = getTranslations(locale);
```

E utilizar:

```astro
{t.nav.blog}
```

em vez de escrever diretamente:

```astro
Blog
```

Isso mantém os textos da interface separados da estrutura dos componentes.

## Identificando o idioma atual

Também precisamos descobrir qual idioma corresponde à URL que está sendo acessada.

Criei alguns utilitários em:

```text
src/i18n/utils.ts
```

O primeiro deles identifica o idioma a partir do primeiro segmento da URL:

```ts
import type { Locale } from './index';

const supportedLocales: Locale[] = ['pt-BR', 'en', 'fr', 'es'];

export function getLocaleFromUrl(url: URL): Locale {
	const [, firstSegment] = url.pathname.split('/');

	if (firstSegment && supportedLocales.includes(firstSegment as Locale)) {
		return firstSegment as Locale;
	}

	return 'pt-BR';
}
```

Assim, uma URL como:

```text
/en/blog/...
```

retorna:

```text
en
```

Enquanto:

```text
/blog/...
```

retorna:

```text
pt-BR
```

Também criei uma função para obter o prefixo correspondente:

```ts
export function getLocalePrefix(locale: Locale): string {
	return locale === 'pt-BR' ? '' : `/${locale}`;
}
```

Isso permite gerar URLs sem precisar espalhar regras de idioma pelo projeto.

Por exemplo:

```ts
getLocalePrefix('pt-BR');
```

retorna:

```text
''
```

Enquanto:

```ts
getLocalePrefix('en');
```

retorna:

```text
/en
```

## Internacionalizando o conteúdo do blog

A interface não é a única parte que precisa ser traduzida.

Os próprios artigos também precisam indicar qual idioma representam e qual artigo original corresponde àquela tradução.

Para isso, adicionei dois campos ao schema da coleção de blog:

```ts
lang: z.enum(['pt-BR', 'en', 'fr', 'es']),
translationKey: z.string(),
```

O `lang` identifica o idioma do artigo.

Já o `translationKey` funciona como um identificador compartilhado entre todas as traduções do mesmo conteúdo.

Por exemplo, o artigo sobre Astro utiliza:

```yaml
lang: pt-BR
translationKey: astro-github-pages
```

A versão em inglês utiliza:

```yaml
lang: en
translationKey: astro-github-pages
```

A versão em francês:

```yaml
lang: fr
translationKey: astro-github-pages
```

E a versão em espanhol:

```yaml
lang: es
translationKey: astro-github-pages
```

Dessa forma, podemos descobrir que quatro arquivos diferentes são, na realidade, traduções do mesmo artigo.

## Criando os arquivos traduzidos

Cada idioma possui seu próprio arquivo Markdown.

A versão original está em:

```text
src/content/blog/construindo-site-astro-github-pages.md
```

A versão em inglês:

```text
src/content/blog/building-a-site-with-astro-github-pages.md
```

A versão em francês:

```text
src/content/blog/creer-un-site-avec-astro-et-github-pages.md
```

E a versão em espanhol:

```text
src/content/blog/crear-un-sitio-con-astro-y-github-pages.md
```

Apesar de serem arquivos diferentes, todos possuem a mesma `translationKey`.

Isso permite que o Astro trate cada arquivo como um post independente, enquanto a aplicação consegue relacioná-los como traduções.

## Criando utilitários para os posts

Com o schema preparado, criei algumas funções para trabalhar com os artigos.

O primeiro objetivo é conseguir obter somente os posts de determinado idioma:

```ts
export function getPostsByLocale(
	posts: Post[],
	locale: Post['data']['lang'],
) {
	return posts.filter((post) => post.data.lang === locale);
}
```

Isso é importante porque o mesmo projeto agora possui quatro versões de cada conteúdo.

Quando estamos na home em inglês, por exemplo, não queremos mostrar os artigos em português.

Podemos fazer:

```ts
const posts = getPostsByLocale(
	await getPublishedPosts(),
	'en',
);
```

E obter somente os posts em inglês.

Também criei uma função para encontrar a tradução correspondente a um artigo:

```ts
export function getTranslatedPost(
	posts: Post[],
	post: Post,
	locale: Post['data']['lang'],
) {
	return posts.find(
		(candidate) =>
			candidate.data.translationKey === post.data.translationKey &&
			candidate.data.lang === locale,
	);
}
```

A lógica é simples:

1. procuramos um post com a mesma `translationKey`;
2. verificamos se ele possui o idioma solicitado;
3. retornamos a tradução encontrada.

Essa função será utilizada pelo seletor de idiomas.

## Criando as rotas para cada idioma

O próximo passo é criar as páginas correspondentes aos idiomas.

A estrutura do projeto ficou semelhante a:

```text
src/pages/
├── index.astro
├── blog/
│   ├── [...page].astro
│   └── [...slug].astro
├── en/
│   ├── index.astro
│   └── blog/
│       ├── [...page].astro
│       └── [...slug].astro
├── fr/
│   ├── index.astro
│   └── blog/
│       ├── [...page].astro
│       └── [...slug].astro
└── es/
    ├── index.astro
    └── blog/
        ├── [...page].astro
        └── [...slug].astro
```

A estrutura deixa explícito que cada idioma possui suas próprias páginas.

A página:

```text
src/pages/index.astro
```

representa o português.

Enquanto:

```text
src/pages/en/index.astro
```

representa o inglês.

O mesmo princípio é utilizado para francês e espanhol.

## Filtrando o blog por idioma

Nas páginas de listagem do blog, utilizamos o idioma correspondente à rota.

Na página em português:

```ts
const posts = getPostsByLocale(
	await getPublishedPosts(),
	'pt-BR',
);
```

Na página em inglês:

```ts
const posts = getPostsByLocale(
	await getPublishedPosts(),
	'en',
);
```

E o mesmo acontece para francês e espanhol.

Isso garante que a listagem de cada idioma contenha somente os artigos daquela versão.

Além de melhorar a experiência de navegação, essa separação também evita misturar conteúdos em idiomas diferentes na mesma página.

## Criando o seletor de idiomas

Com os artigos relacionados através da `translationKey`, podemos criar o seletor de idiomas no header.

Primeiro, identificamos o idioma atual:

```ts
const locale = getLocaleFromUrl(Astro.url);
```

Depois carregamos as traduções da interface:

```ts
const t = getTranslations(locale);
```

E definimos os idiomas disponíveis:

```ts
const languages: { locale: Locale; label: string }[] = [
	{ locale: 'pt-BR', label: 'PT' },
	{ locale: 'en', label: 'EN' },
	{ locale: 'fr', label: 'FR' },
	{ locale: 'es', label: 'ES' },
];
```

Quando estamos dentro de um artigo, o seletor procura a tradução correspondente:

```ts
const translatedPost = getTranslatedPost(
	posts,
	currentPost,
	targetLocale,
);
```

Se a tradução existir, geramos a URL do artigo traduzido:

```ts
return `${getLocalePrefix(targetLocale)}/blog/${translatedPost.id}/`;
```

Assim, se estivermos lendo a versão em português e selecionarmos inglês, a navegação leva diretamente para a versão inglesa daquele mesmo artigo.

Se uma tradução ainda não existir, o seletor pode direcionar o leitor para a listagem do blog daquele idioma.

## Mantendo a navegação correta fora dos artigos

O seletor de idioma também precisa funcionar em páginas que não são artigos.

Nesse caso, não existe uma `translationKey` para utilizar.

Então, a aplicação preserva o caminho atual e apenas troca o prefixo do idioma.

Por exemplo:

```text
/blog/
```

pode ser convertido em:

```text
/en/blog/
```

ou:

```text
/fr/blog/
```

Isso mantém a navegação consistente em todo o site.

## Atualizando o layout

O layout principal também precisa conhecer o idioma atual.

No `Layout.astro`, utilizamos:

```ts
const locale = getLocaleFromUrl(Astro.url);
const t = getTranslations(locale);
```

O idioma também é aplicado ao elemento `<html>`:

```astro
<html lang={locale}>
```

Assim, uma página em português terá:

```html
<html lang="pt-BR">
```

e uma página em inglês:

```html
<html lang="en">
```

Além de ser semanticamente correto, isso fornece ao navegador e a outras ferramentas uma informação explícita sobre o idioma do conteúdo.

## Atualizando os links dos artigos

Existe mais um detalhe importante quando começamos a trabalhar com múltiplos idiomas.

Os cards do blog são componentes compartilhados entre todas as páginas.

Por isso, o link do artigo não pode ser fixo como:

```astro
<a href={`/blog/${post.id}/`}>
```

Em uma página em inglês, por exemplo, precisamos gerar:

```text
/en/blog/...
```

Para resolver isso, o componente obtém o idioma atual:

```ts
const locale = getLocaleFromUrl(Astro.url);
const localePrefix = getLocalePrefix(locale);
```

E utiliza o prefixo na URL:

```astro
<a href={`${localePrefix}/blog/${post.id}/`}>
	{title}
</a>
```

Como o prefixo do português é uma string vazia, o comportamento continua sendo:

```text
/blog/...
```

Enquanto os demais idiomas recebem seus respectivos prefixos:

```text
/en/blog/...
/fr/blog/...
/es/blog/...
```

Dessa forma, podemos reutilizar o mesmo componente para todas as versões do site.

## Resultado final

Depois dessas alterações, temos uma estrutura em que o idioma está presente em todas as partes importantes do site.

A home possui uma versão para cada idioma:

```text
/
/en/
/fr/
/es/
```

O blog também:

```text
/blog/
/en/blog/
/fr/blog/
/es/blog/
```

E cada artigo possui sua própria versão traduzida:

```text
/blog/artigo-em-portugues/
/en/blog/article-in-english/
/fr/blog/article-en-francais/
/es/blog/articulo-en-espanol/
```

O relacionamento entre essas versões é feito pela `translationKey`.

Isso permite que o usuário navegue entre as traduções sem precisar procurar manualmente pelo conteúdo correspondente.

## Validando a implementação

Depois de concluir as alterações, é importante validar o build de produção.

Execute:

```bash
npm run build
```

Se o build terminar corretamente, podemos verificar as páginas geradas para os diferentes idiomas.

No meu caso, a estrutura final passou a incluir:

```text
/
/blog/
/en/
/en/blog/
/fr/
/fr/blog/
/es/
/es/blog/
```

Também validei a navegação no navegador.

A partir da home de cada idioma, os artigos são abertos utilizando a URL correspondente àquele idioma.

Dentro de um artigo, o seletor de idiomas também leva para a tradução correta.

## Conclusão

Internacionalizar o site não significou apenas traduzir os textos da interface.

Foi necessário pensar na estrutura como um todo: URLs, conteúdo, navegação e relacionamento entre as traduções.

A utilização do recurso de i18n do Astro resolveu a parte de roteamento, enquanto os arquivos de tradução permitiram separar os textos da interface dos componentes.

Para o conteúdo do blog, a combinação de `lang` e `translationKey` criou uma forma simples de identificar o idioma de cada artigo e relacionar as diferentes versões do mesmo conteúdo.

No final, temos uma única aplicação Astro capaz de publicar o mesmo site em quatro idiomas, mantendo URLs próprias e permitindo que o leitor alterne entre as traduções.

A estrutura também deixa o projeto preparado para crescer. Quando novos artigos forem publicados, basta criar suas versões nos idiomas desejados e utilizar a mesma `translationKey` para relacioná-las.

Esse foi mais um passo na construção do site, mas também uma boa oportunidade para perceber como pequenas decisões de arquitetura podem evitar que a internacionalização se transforme em uma série de regras espalhadas pelo projeto.

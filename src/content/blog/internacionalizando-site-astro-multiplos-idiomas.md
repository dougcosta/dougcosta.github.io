---
title: "Internacionalizando um site Astro com múltiplos idiomas"
description: "Como adicionar suporte a múltiplos idiomas em um site Astro, organizando traduções, rotas, conteúdo e navegação."
lang: pt-BR
translationKey: multilanguage-astro
pubDate: 2026-09-29
tags:
  - Astro
  - i18n
  - JavaScript
  - Web
draft: true
---

## Introdução

Hoje é muito simples traduzir o conteúdo de um site. Há ferramentas disponíveis nos próprios navegadores que fazem esse trabalho. Entretanto, apesar desse processo automático ter evoluído muito, nem sempre ele respeita as expressões de cada língua.

Uma forma de evitar esse tipo de situação é oferecer o conteúdo em outros idiomas.

Outra vantagem dessa estratégia é permitir que cada versão linguística tenha uma URL própria, facilitando que os mecanismos de busca descubram, indexem e apresentem a versão adequada do conteúdo.

Por isso, apliquei em meu site pessoal o suporte para quatro idiomas, _português do Brasil_ (minha língua nativa), _inglês_, _francês_ e _espanhol_, e vou demonstrar neste artigo como implementei essa estrutura utilizando os recursos de internacionalização do Astro.

A internacionalização deve envolver os textos da interface e também o conteúdo do blog. Isso significa que cada artigo pode possuir versões traduzidas, cada uma com sua própria URL.

A ideia foi manter uma única aplicação, mas permitir que cada idioma tenha suas próprias páginas, traduções e artigos.

## O que queremos construir

Antes de começar, vale definir como queremos que as URLs funcionem.

O português será o idioma padrão do site e, por isso, não terá um prefixo na URL:

```text
https://dougcosta.com/
https://dougcosta.com/blog/
```

Para os demais idiomas, utilizaremos um prefixo:

```text
https://dougcosta.com/en/
https://dougcosta.com/en/blog/

https://dougcosta.com/fr/
https://dougcosta.com/fr/blog/

https://dougcosta.com/es/
https://dougcosta.com/es/blog/
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

A configuração ficou assim:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://dougcosta.com',

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

é importante para o comportamento que queremos. Ela significa que o idioma padrão não terá um prefixo na URL.

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

Para isso, vamos criar uma estrutura específica dentro de `src`:

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

Também permite que as traduções fiquem concentradas em um único lugar e não espalhadas pelo site, ou seja, ao alterar um texto nesse arquivo, todas as páginas e componentes que utilizam essa tradução passam a exibir o novo valor.

A inclusão de um novo idioma exige atualizar a configuração do Astro e os pontos do projeto que enumeram os locales suportados, além de criar as respectivas traduções e rotas.

## Centralizando os idiomas

Depois de criar os arquivos individuais, precisamos disponibilizar as traduções de uma forma centralizada.

Para isso, vamos criar:

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

Vamos criar alguns utilitários em:

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
Como o português é o idioma padrão e não possui prefixo na URL, quando o primeiro segmento não corresponde a um locale suportado, assumimos pt-BR.

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

O segundo é uma função para obter o prefixo correspondente:

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

Os próprios artigos também precisam indicar qual idioma representam e a qual conteúdo traduzido pertencem.

Para isso, vamos abrir o arquivo:
```bash
src/content.config.ts
```

E adicionar dois campos ao schema da coleção de blog:

```ts
lang: z.enum(['pt-BR', 'en', 'fr', 'es']),
translationKey: z.string(),
```

Ficará assim:
```ts
...

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			lang: z.enum(['pt-BR', 'en', 'fr', 'es']), // NOVO CAMPO
			translationKey: z.string(), // NOVO CAMPO
			pubDate: z.coerce.date(),
			...
		}),
});

export const collections = { blog };
```

O `lang` identifica o idioma do artigo.

Já o `translationKey` funciona como um identificador compartilhado entre todas as versões do mesmo conteúdo.

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

Dessa forma, podemos identificar que esses arquivos representam diferentes versões linguísticas do mesmo conteúdo.

## Criando os arquivos traduzidos

Cada versão traduzida possui seu próprio arquivo de conteúdo.

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

Com o schema preparado, vamos criar algumas funções para trabalhar com os artigos.

Uma regra importante da implementação é que **toda listagem de posts deve ser filtrada pelo locale da página que está sendo renderizada**. Não basta criar rotas diferentes para cada idioma. Como todos os artigos ficam na mesma coleção, as consultas precisam selecionar explicitamente o idioma correto.

O primeiro objetivo é conseguir obter somente os posts de determinado idioma.

Para isso, vamos criar a função `getPostsByLocale` dentro dos utilitários que dão suporte aos artigos que ficam no arquivo `src/utils/posts.ts`:
```ts
export function getPostsByLocale(
	posts: Post[],
	locale: Post['data']['lang'],
) {
	return posts.filter((post) => post.data.lang === locale);
}
```

Isso é importante porque o mesmo projeto pode possuir versões do conteúdo em diferentes idiomas.

Quando estamos na home em inglês, por exemplo, não queremos mostrar os artigos em português.

Podemos fazer:

```ts
const posts = getPostsByLocale(
	await getPublishedPosts(),
	'en',
);
```

E obter somente os posts em inglês.

A mesma regra deve ser aplicada às páginas de listagem do blog, às páginas paginadas e a qualquer outra tela que apresente uma coleção de artigos. Assim, a separação por idioma não fica restrita às rotas e é respeitada pelos dados exibidos em cada página. Veremos mais para frente como esse mecanismo funcionará.

Ainda no arquivo `src/utils/posts.ts`, vamos criar uma função para encontrar a tradução correspondente a um artigo:

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

A lógica procura um artigo com a mesma `translationKey`, verifica se ele possui o idioma solicitado e retorna a tradução encontrada.

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

Vamos criar um diretório para cada idioma (en, fr e es) dentro de `src/pages/` e criar nesses diretórios as páginas correspondentes às rotas que queremos disponibilizar em cada idioma. A estrutura deixa explícito que cada idioma possui suas próprias páginas.

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

Nas páginas que exibem listas de artigos, como a home e a listagem do blog, utilizamos o locale correspondente a cada rota.

Na home em português:

```ts
const posts = getPostsByLocale(
	await getPublishedPosts(),
	'pt-BR',
);
```

Na home em inglês:

```ts
const posts = getPostsByLocale(
	await getPublishedPosts(),
	'en',
);
```

E o mesmo acontece para francês e espanhol.

Isso garante que a listagem de cada idioma contenha somente os artigos correspondentes àquele idioma.

Essa filtragem deve acontecer **antes da paginação**. Primeiro selecionamos os posts do locale atual e somente depois passamos essa coleção para a lógica que cria as páginas paginadas. Dessa forma, a quantidade de posts por página e o número total de páginas também são calculados exclusivamente com base no idioma atual.

A regra vale para todas as rotas de listagem: home, blog e páginas paginadas. Cada uma delas deve obter os posts publicados e, em seguida, aplicar `getPostsByLocale()` com o locale correspondente à própria rota.

Deve ficar parecido com:
```astro
---
import Layout from '../layouts/Layout.astro';
import PostCard from '../components/PostCard.astro';
import { BLOG, SITE } from '../consts';
import { getTranslations } from '../i18n';
import { getPostsByLocale, getPublishedPosts } from '../utils/posts';

const t = getTranslations('pt-BR');

// Busca apenas os artigos correspondentes ao idioma atual.
const posts = getPostsByLocale(
	await getPublishedPosts(),
	'pt-BR',
).slice(0, BLOG.postsOnHome);
---

<Layout description={SITE.description}>
	<section class="hero wrap">
		<p class="eyebrow">{t.home.eyebrow}</p>
		<h1>Doug Costa</h1>
		<p class="lede">{SITE.tagline}</p>
		<p class="intro">{t.home.intro}</p>
		<a class="cta" href="/blog/">{t.home.readBlog}</a>
	</section>
	<section class="latest wrap">
		<div class="latest__head"><h2>{t.home.latestPosts}</h2><a href="/blog/">{t.home.allPosts}</a></div>
		<!-- Lista os artigos do idioma atual. -->
		{posts.length ? posts.map((post) => <PostCard post={post} />) : <p class="empty">{t.home.empty}</p>}
	</section>
</Layout>
...
```

Além de melhorar a experiência de navegação, essa separação evita misturar conteúdos em idiomas diferentes na mesma página e mantém a paginação coerente com o idioma selecionado.

## Criando o seletor de idiomas

Com os artigos relacionados através da `translationKey`, podemos criar o seletor de idiomas no header.

Para isso, no arquivo `src/components/Header.astro`, importamos os utilitários de tradução que criamos

```astro
---
import { getTranslations, type Locale } from '../i18n';
import { getLocaleFromUrl, getLocalePrefix } from '../i18n/utils';
import type { CollectionEntry } from 'astro:content';
import { getPublishedPosts, getTranslatedPost } from '../utils/posts';
...
```

Identificamos o idioma atual:

```ts
const locale = getLocaleFromUrl(Astro.url);
```

Carregamos as traduções da interface:

```ts
const t = getTranslations(locale);
```

Definimos os idiomas disponíveis:

```ts
const languages: { locale: Locale; label: string }[] = [
	{ locale: 'pt-BR', label: 'PT' },
	{ locale: 'en', label: 'EN' },
	{ locale: 'fr', label: 'FR' },
	{ locale: 'es', label: 'ES' },
];
```

Calculamos o prefixo correspondente ao idioma atual:
```ts
const basePath = locale === 'pt-BR' ? '' : `/${locale}`;
```

Mapeamos os itens do menu de navegação do site (que permite navegar entre a home, listagem de artigos e sobre):
```ts
const NAV = [
	{ href: `${basePath}/`, label: t.nav.home },
	{ href: `${basePath}/blog/`, label: t.nav.blog },
	{ href: `${basePath}/about/`, label: t.nav.about },
];
```

Criamos uma função que gera o caminho correspondente ao idioma selecionado:
```ts
const languagePath = (targetLocale: Locale) => {
	if (!currentPost) {
		const prefix = getLocalePrefix(targetLocale);
		const currentPath = Astro.url.pathname;

		const pathWithoutLocale =
			locale === 'pt-BR'
				? currentPath
				: currentPath.replace(new RegExp(`^/${locale}`), '') || '/';

		return `${prefix}${pathWithoutLocale === '/' ? '/' : pathWithoutLocale}`;
	}

	const translatedPost = getTranslatedPost(
		posts,
		currentPost,
		targetLocale,
	);

	if (!translatedPost) {
		return `${getLocalePrefix(targetLocale)}/blog/`;
	}

	return `${getLocalePrefix(targetLocale)}/blog/${translatedPost.id}/`;
};
```

Nessa função, quando estamos dentro de um artigo, o seletor procura a tradução correspondente:

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

`basePath` representa o prefixo do idioma atual e é utilizado nos links fixos do menu. Já `getLocalePrefix()` é usado quando precisamos gerar uma URL para um idioma de destino.

Assim, se estivermos lendo a versão em português e selecionarmos inglês, a navegação leva diretamente para a versão inglesa daquele mesmo artigo.

Se uma tradução ainda não existir, o seletor pode direcionar o leitor para a listagem do blog daquele idioma.

No `header`, passamos a utilizar o `basePath` que contém o caminho base atual como referência da página:
```astro
<a class="brand" href={`${basePath}/`}>{SITE.title}</a>
```

E incluímos um seletor de idiomas no header:
```astro
<div class="language-switcher" aria-label="Language">
	{languages.map(({ locale: targetLocale, label }) => (
		<a
			href={languagePath(targetLocale)}
			aria-current={locale === targetLocale ? 'page' : undefined}
		>
			{label}
		</a>
	))}
</div>
```

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

Para resolver isso, dentro dos componentes `src/components/PostCard.astro` e `src/layouts/BlogPost.astro` obtemos o idioma atual:

```ts
const locale = getLocaleFromUrl(Astro.url);
const localePrefix = getLocalePrefix(locale);
```

Como prefixo na URL, utilizamos o que foi armazenado em `localePrefix`:

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

## Mantendo os links das tags no idioma correto

As tags também fazem parte da navegação do blog e precisam respeitar o locale atual. 

Como as tags são reutilizadas pelos artigos de todos os idiomas, não devemos gerar o link sempre a partir da rota padrão:

```astro
<a href={`/tags/${tagSlug(tag)}/`}>
	#{tag}
</a>
```

Em uma página em inglês, por exemplo, esse código levaria para:

```text
/tags/astro/
```

quando o correto é:

```text
/en/tags/astro/
```

No componente `src/components/PostCard.astro` e no `src/layouts/BlogPost.astro`, vamos alterar os links das tags para utilizar o prefixo que está armazenado em `localePrefix`. O link passa a ser:

```astro
<a href={`${localePrefix}/tags/${tagSlug(tag)}/`}>
	#{tag}
</a>
```

Assim, os componentes responsáveis pela renderização das tags podem gerar os links corretamente em todos os idiomas:

```text
/tags/astro/
/en/tags/astro/
/fr/tags/astro/
/es/tags/astro/
```

A mesma preocupação deve ser aplicada a outros links gerados dentro de componentes compartilhados. Sempre que uma URL depender do idioma atual, o componente deve obter o locale da URL atual e utilizar o prefixo correspondente, em vez de assumir que a rota padrão é sempre `/`.

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

E cada artigo pode possuir sua própria versão traduzida:

```text
/blog/artigo-em-portugues/
/en/blog/article-in-english/
/fr/blog/article-en-francais/
/es/blog/articulo-en-espanol/
```

O relacionamento entre essas versões é feito pela `translationKey`.

Isso permite que o usuário navegue entre as traduções sem precisar procurar manualmente pelo conteúdo correspondente.


## Conclusão

Internacionalizar o site não significou apenas traduzir os textos da interface.

Foi necessário pensar na estrutura como um todo: URLs, conteúdo, listagens, navegação e relacionamento entre as traduções. Cada página deve exibir apenas o conteúdo do seu locale e os links gerados pelos componentes compartilhados também precisam preservar esse contexto.

A configuração de i18n do Astro estabeleceu as regras de roteamento por idioma, enquanto a estrutura de páginas e os utilitários do projeto cuidaram da geração e navegação entre essas rotas.

Para o conteúdo do blog, a combinação de `lang` e `translationKey` criou uma forma simples de identificar o idioma de cada artigo e relacionar as diferentes versões do mesmo conteúdo.

No final, temos uma única aplicação Astro capaz de publicar o mesmo site em quatro idiomas, mantendo URLs próprias, listagens isoladas por idioma, navegação localizada e permitindo que o leitor alterne entre as traduções.

A estrutura também deixa o projeto preparado para crescer. Quando novos artigos forem publicados, basta criar suas versões nos idiomas desejados e utilizar a mesma `translationKey` para relacioná-las.

## Links úteis

Se você ainda não possui um site e quer criar um utilizando Astro, veja também o artigo:

- [Construindo um site com Astro e publicando no GitHub Pages com GitHub Actions](../construindo-site-astro-github-pages/)

Se você utiliza o Astro e, assim como eu, quer que os links externos do seu site abram em uma nova aba, veja como fiz essa implementação no artigo:  

- [Fazendo links externos dos posts abrirem em uma nova aba no Astro](../astro-links-em-nova-aba/)

Se você quer configurar o Google Analytics em um site, veja também o artigo:

- [Configurando o Google Analytics em um site](../configurando-google-analytics-em-um-site)

## Referências

A implementação apresentada neste artigo foi baseada principalmente na documentação oficial do Astro:

- [Internationalization (i18n) Routing — Astro Documentation](https://docs.astro.build/en/guides/internationalization/)
- [Configuration Reference — Astro Documentation](https://docs.astro.build/en/reference/configuration-reference/)
- [Content Collections — Astro Documentation](https://docs.astro.build/en/guides/content-collections/)
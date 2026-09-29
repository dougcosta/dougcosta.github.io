---
title: "Internationalizing an Astro Site with Multiple Languages"
description: "How to add support for multiple languages to an Astro site, organizing translations, routes, content, and navigation."
lang: en
translationKey: multilanguage-astro
pubDate: 2026-09-29
tags:
  - Astro
  - i18n
  - JavaScript
  - Web
draft: false
---

## Introduction

Today, translating a website's content is very easy. Browsers themselves provide tools that can do this automatically. However, even though this automated process has evolved considerably, it does not always respect the expressions and nuances of each language.

One way to avoid this kind of situation is to offer the content in multiple languages.

Another advantage of this approach is that each language version can have its own URL, making it easier for search engines to discover, index, and present the appropriate version of the content.

For this reason, I added support for four languages to my personal website: _Brazilian Portuguese_ (my native language), _English_, _French_, and _Spanish_. In this article, I will show how I implemented this structure using Astro's internationalization features.

Internationalization should cover both interface text and blog content. This means that each article can have translated versions, each with its own URL.

The idea was to keep a single application while allowing each language to have its own pages, translations, and articles.

## What We Want to Build

Before getting started, it is worth defining how we want the URLs to work.

Portuguese will be the site's default language and therefore will not have a URL prefix:

```text
https://dougcosta.com/
https://dougcosta.com/blog/
```

For the other languages, we will use a prefix:

```text
https://dougcosta.com/en/
https://dougcosta.com/en/blog/

https://dougcosta.com/fr/
https://dougcosta.com/fr/blog/

https://dougcosta.com/es/
https://dougcosta.com/es/blog/
```

The same principle will be used for articles.

For example, the same article can have the following URLs:

```text
/blog/construindo-site-astro-github-pages/
/en/blog/building-a-site-with-astro-github-pages/
/fr/blog/creer-un-site-avec-astro-et-github-pages/
/es/blog/crear-un-sitio-con-astro-y-github-pages/
```

This gives us separate URLs for each language instead of trying to place all translations on the same page.

## Configuring Internationalization in Astro

The first step is to tell Astro which languages will be supported.

This configuration goes in the file:

```text
astro.config.mjs
```

The configuration looks like this:

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

The `defaultLocale` property defines the site's default language.

In this case:

```text
pt-BR
```

The `locales` array lists all available languages.

The configuration:

```js
prefixDefaultLocale: false
```

is important for the behavior we want. It means that the default language will not have a URL prefix.

So:

```text
/
```

represents Portuguese, while:

```text
/en/
/fr/
/es/
```

represent the other languages.

## Creating Translation Files

In addition to routing, we need to translate the text that is part of the site's interface.

To do this, we will create a dedicated structure inside `src`:

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

Each language file contains the corresponding translations.

For example, the `pt-BR.ts` file contains text such as:

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

The advantage of this approach is that components can use the same structure regardless of the current language.

It also keeps translations centralized instead of spreading them throughout the site. In other words, when you change a text in this file, every page and component that uses that translation will display the new value.

Adding a new language requires updating the Astro configuration and the parts of the project that enumerate the supported locales, as well as creating the corresponding translations and routes.

## Centralizing Languages

After creating the individual files, we need to make the translations available in a centralized way.

To do this, we will create:

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

With this, a component can simply retrieve the translations for the current language:

```ts
const t = getTranslations(locale);
```

And use:

```astro
{t.nav.blog}
```

instead of writing it directly:

```astro
Blog
```

This keeps interface text separate from the component structure.

## Identifying the Current Language

We also need to determine which language corresponds to the URL being accessed.

We will create some utilities in:

```text
src/i18n/utils.ts
```

The first one identifies the language from the first segment of the URL:

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
Because Portuguese is the default language and has no URL prefix, when the first segment does not match a supported locale, we assume `pt-BR`.

So a URL such as:

```text
/en/blog/...
```

returns:

```text
en
```

While:

```text
/blog/...
```

returns:

```text
pt-BR
```

The second is a function for obtaining the corresponding prefix:

```ts
export function getLocalePrefix(locale: Locale): string {
	return locale === 'pt-BR' ? '' : `/${locale}`;
}
```

This allows us to generate URLs without scattering language rules throughout the project.

For example:

```ts
getLocalePrefix('pt-BR');
```

returns:

```text
''
```

While:

```ts
getLocalePrefix('en');
```

returns:

```text
/en
```

## Internationalizing Blog Content

The interface is not the only part that needs to be translated.

The articles themselves also need to indicate which language they represent and which translated content they belong to.

To do this, let's open the file:
```bash
src/content.config.ts
```

And add two fields to the blog collection schema:

```ts
lang: z.enum(['pt-BR', 'en', 'fr', 'es']),
translationKey: z.string(),
```

It will look like this:
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

The `lang` field identifies the language of the article.

The `translationKey` works as a shared identifier across all versions of the same content.

For example, the Astro article uses:

```yaml
lang: pt-BR
translationKey: astro-github-pages
```

The English version uses:

```yaml
lang: en
translationKey: astro-github-pages
```

The French version:

```yaml
lang: fr
translationKey: astro-github-pages
```

E a versão em espanhol:

```yaml
lang: es
translationKey: astro-github-pages
```

This way, we can identify these files as different language versions of the same content.

## Creating the Translated Files

Each translated version has its own content file.

The original version is located at:

```text
src/content/blog/construindo-site-astro-github-pages.md
```

The English version:

```text
src/content/blog/building-a-site-with-astro-github-pages.md
```

The French version:

```text
src/content/blog/creer-un-site-avec-astro-et-github-pages.md
```

E a versão em espanhol:

```text
src/content/blog/crear-un-sitio-con-astro-y-github-pages.md
```

Although they are different files, they all use the same `translationKey`.

This allows Astro to treat each file as an independent post while the application can associate them as translations.

## Creating Post Utilities

With the schema ready, let's create some functions for working with articles.

An important implementation rule is that **every post listing must be filtered by the locale of the page being rendered**. It is not enough to create different routes for each language. Since all articles live in the same collection, queries must explicitly select the correct language.

The first goal is to retrieve only the posts for a given language.

To do this, we will create the `getPostsByLocale` function inside the utilities that support the articles in `src/utils/posts.ts`:
```ts
export function getPostsByLocale(
	posts: Post[],
	locale: Post['data']['lang'],
) {
	return posts.filter((post) => post.data.lang === locale);
}
```

This is important because the same project can contain versions of the content in different languages.

For example, when we are on the English home page, we do not want to show articles in Portuguese.

We can do:

```ts
const posts = getPostsByLocale(
	await getPublishedPosts(),
	'en',
);
```

And retrieve only the English posts.

The same rule must be applied to blog listing pages, paginated pages, and any other screen that displays a collection of articles. This way, language separation is not limited to routes and is also respected by the data displayed on each page. We will see later how this mechanism works.

Still in `src/utils/posts.ts`, we will create a function to find the translation corresponding to an article:

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

The logic looks for an article with the same `translationKey`, checks whether it has the requested language, and returns the translation found.

This function will be used by the language selector.

## Creating Routes for Each Language

The next step is to create the pages corresponding to each language.

The project structure looks like this:

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

We will create a directory for each language (en, fr, and es) inside `src/pages/` and create the pages corresponding to the routes we want to make available in each language. The structure makes it explicit that each language has its own pages.

The page:

```text
src/pages/index.astro
```

represents Portuguese.

While:

```text
src/pages/en/index.astro
```

represents English.

The same principle is used for French and Spanish.

## Filtering the Blog by Language

On pages that display article lists, such as the home page and blog listing, we use the locale corresponding to each route.

On the Portuguese home page:

```ts
const posts = getPostsByLocale(
	await getPublishedPosts(),
	'pt-BR',
);
```

On the English home page:

```ts
const posts = getPostsByLocale(
	await getPublishedPosts(),
	'en',
);
```

The same applies to French and Spanish.

This ensures that each language listing contains only the articles corresponding to that language.

This filtering must happen **before pagination**. First, we select the posts for the current locale and only then pass that collection to the logic that creates paginated pages. This way, the number of posts per page and the total number of pages are also calculated exclusively based on the current language.

The rule applies to all listing routes: home, blog, and paginated pages. Each one must retrieve the published posts and then apply `getPostsByLocale()` with the locale corresponding to its own route.

It should look something like this:
```astro
---
import Layout from '../layouts/Layout.astro';
import PostCard from '../components/PostCard.astro';
import { BLOG, SITE } from '../consts';
import { getTranslations } from '../i18n';
import { getPostsByLocale, getPublishedPosts } from '../utils/posts';

const t = getTranslations('pt-BR');

// Fetch only the articles corresponding to the current language.
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
<!-- List the articles for the current language. -->
		{posts.length ? posts.map((post) => <PostCard post={post} />) : <p class="empty">{t.home.empty}</p>}
	</section>
</Layout>
...
```

In addition to improving the browsing experience, this separation prevents content in different languages from being mixed on the same page and keeps pagination consistent with the selected language.

## Creating the Language Selector

With the articles linked through `translationKey`, we can create the language selector in the header.

To do this, in `src/components/Header.astro`, we import the translation utilities we created

```astro
---
import { getTranslations, type Locale } from '../i18n';
import { getLocaleFromUrl, getLocalePrefix } from '../i18n/utils';
import type { CollectionEntry } from 'astro:content';
import { getPublishedPosts, getTranslatedPost } from '../utils/posts';
...
```

We identify the current language:

```ts
const locale = getLocaleFromUrl(Astro.url);
```

We load the interface translations:

```ts
const t = getTranslations(locale);
```

We define the available languages:

```ts
const languages: { locale: Locale; label: string }[] = [
	{ locale: 'pt-BR', label: 'PT' },
	{ locale: 'en', label: 'EN' },
	{ locale: 'fr', label: 'FR' },
	{ locale: 'es', label: 'ES' },
];
```

We calculate the prefix corresponding to the current language:
```ts
const basePath = locale === 'pt-BR' ? '' : `/${locale}`;
```

We map the site navigation menu items (which allow navigation between the home page, article listing, and about page):
```ts
const NAV = [
	{ href: `${basePath}/`, label: t.nav.home },
	{ href: `${basePath}/blog/`, label: t.nav.blog },
	{ href: `${basePath}/about/`, label: t.nav.about },
];
```

We create a function that generates the path corresponding to the selected language:
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

In this function, when we are inside an article, the selector looks for the corresponding translation:

```ts
const translatedPost = getTranslatedPost(
	posts,
	currentPost,
	targetLocale,
);
```

If the translation exists, we generate the URL for the translated article:

```ts
return `${getLocalePrefix(targetLocale)}/blog/${translatedPost.id}/`;
```

`basePath` represents the current language prefix and is used for the fixed menu links. `getLocalePrefix()` is used when we need to generate a URL for a target language.

So, if we are reading the Portuguese version and select English, navigation takes us directly to the English version of that same article.

If a translation does not exist yet, the selector can direct the reader to that language's blog listing.

In the `header`, we use the `basePath`, which contains the current base path, as the page reference:
```astro
<a class="brand" href={`${basePath}/`}>{SITE.title}</a>
```

And we add a language selector to the header:
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

The language selector also needs to work on pages that are not articles.

In this case, there is no `translationKey` to use.

So the application preserves the current path and only changes the language prefix.

For example:

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

This keeps navigation consistent throughout the site.

## Updating the Layout

The main layout also needs to know the current language.

In `Layout.astro`, we use:

```ts
const locale = getLocaleFromUrl(Astro.url);
const t = getTranslations(locale);
```

The language is also applied to the `<html>` element:

```astro
<html lang={locale}>
```

Thus, a Portuguese page will have:

```html
<html lang="pt-BR">
```

e uma página em inglês:

```html
<html lang="en">
```

In addition to being semantically correct, this provides the browser and other tools with explicit information about the language of the content.

## Updating Article Links

There is one more important detail when we start working with multiple languages.

Blog cards are shared components across all pages.

Therefore, the article link cannot be hardcoded as:

```astro
<a href={`/blog/${post.id}/`}>
```

On an English page, for example, we need to generate:

```text
/en/blog/...
```

To solve this, inside the `src/components/PostCard.astro` and `src/layouts/BlogPost.astro` components, we obtain the current language:

```ts
const locale = getLocaleFromUrl(Astro.url);
const localePrefix = getLocalePrefix(locale);
```

For the URL prefix, we use the value stored in `localePrefix`:

```astro
<a href={`${localePrefix}/blog/${post.id}/`}>
	{title}
</a>
```

Because the Portuguese prefix is an empty string, the behavior remains:

```text
/blog/...
```

While the other languages receive their respective prefixes:

```text
/en/blog/...
/fr/blog/...
/es/blog/...
```

This way, we can reuse the same component for all versions of the site.

## Keeping Tag Links in the Correct Language

Tags are also part of blog navigation and need to respect the current locale.

Because tags are reused by articles in all languages, we should not always generate the link from the default route:

```astro
<a href={`/tags/${tagSlug(tag)}/`}>
	#{tag}
</a>
```

On an English page, for example, this code would lead to:

```text
/tags/astro/
```

when the correct URL is:

```text
/en/tags/astro/
```

In `src/components/PostCard.astro` and `src/layouts/BlogPost.astro`, we will change the tag links to use the prefix stored in `localePrefix`. The link becomes:

```astro
<a href={`${localePrefix}/tags/${tagSlug(tag)}/`}>
	#{tag}
</a>
```

This way, the components responsible for rendering tags can generate the links correctly in all languages:

```text
/tags/astro/
/en/tags/astro/
/fr/tags/astro/
/es/tags/astro/
```

The same concern should be applied to other links generated inside shared components. Whenever a URL depends on the current language, the component should obtain the locale from the current URL and use the corresponding prefix instead of assuming that the default route is always `/`.

## Final Result

After these changes, we have a structure in which the language is present in all the important parts of the site.

The home page has a version for each language:

```text
/
/en/
/fr/
/es/
```

The blog does too:

```text
/blog/
/en/blog/
/fr/blog/
/es/blog/
```

And each article can have its own translated version:

```text
/blog/artigo-em-portugues/
/en/blog/article-in-english/
/fr/blog/article-en-francais/
/es/blog/articulo-en-espanol/
```

The relationship between these versions is established through `translationKey`.

This allows users to navigate between translations without having to manually search for the corresponding content.

## Conclusion

Internationalizing the site did not mean simply translating the interface text.

It was necessary to think about the structure as a whole: URLs, content, listings, navigation, and the relationship between translations. Each page must display only the content for its locale, and links generated by shared components must also preserve this context.

Astro's i18n configuration established the language-based routing rules, while the project's page structure and utilities handled the generation and navigation between these routes.

For blog content, the combination of `lang` and `translationKey` created a simple way to identify the language of each article and relate the different versions of the same content.

In the end, we have a single Astro application capable of publishing the same site in four languages, with dedicated URLs, language-specific listings, localized navigation, and the ability for readers to switch between translations.

The structure also leaves the project ready to grow. When new articles are published, you only need to create their versions in the desired languages and use the same `translationKey` to link them.

## Useful Links

If you do not have a website yet and want to build one with Astro, you may also want to read:

- [Building a Website with Astro and Publishing It on GitHub Pages with GitHub Actions](../building-a-site-with-astro-github-pages/)

If you use Astro and, like me, want external links on your site to open in a new tab, see how I implemented it in:

- [Opening External Post Links in a New Tab in Astro](../astro-external-links-new-tab/)

If you want to set up Google Analytics on a website, also see the article:

- [Setting Up Google Analytics on a Website](../setting-up-google-analytics-on-a-website/)

## References

The implementation presented in this article was based primarily on the official Astro documentation:

- [Internationalization (i18n) Routing — Astro Documentation](https://docs.astro.build/en/guides/internationalization/)
- [Configuration Reference — Astro Documentation](https://docs.astro.build/en/reference/configuration-reference/)
- [Content Collections — Astro Documentation](https://docs.astro.build/en/guides/content-collections/)

---
title: "Internationaliser un site Astro avec plusieurs langues"
description: "Comment ajouter la prise en charge de plusieurs langues à un site Astro en organisant les traductions, les routes, le contenu et la navigation."
lang: fr
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

Aujourd’hui, il est très simple de traduire le contenu d’un site web. Les navigateurs eux-mêmes proposent des outils capables de s’en charger. Cependant, même si ce processus automatique a beaucoup évolué, il ne respecte pas toujours les expressions propres à chaque langue.

Une façon d’éviter ce type de situation consiste à proposer le contenu dans plusieurs langues.

Un autre avantage de cette approche est de permettre à chaque version linguistique d’avoir sa propre URL, afin de faciliter la découverte, l’indexation et la présentation de la version appropriée du contenu par les moteurs de recherche.

C’est pourquoi j’ai ajouté à mon site personnel la prise en charge de quatre langues — le _portugais du Brésil_ (ma langue maternelle), l’_anglais_, le _français_ et l’_espagnol_ — et je vais montrer dans cet article comment j’ai mis en place cette structure à l’aide des fonctionnalités d’internationalisation d’Astro.

L’internationalisation doit concerner à la fois les textes de l’interface et le contenu du blog. Cela signifie que chaque article peut avoir des versions traduites, chacune avec sa propre URL.

L’objectif était de conserver une seule application tout en permettant à chaque langue de disposer de ses propres pages, traductions et articles.

## Ce que nous voulons construire

Avant de commencer, il est utile de définir le fonctionnement souhaité pour les URL.

Le portugais sera la langue par défaut du site et n’aura donc pas de préfixe dans l’URL :

```text
https://dougcosta.com/
https://dougcosta.com/blog/
```

Pour les autres langues, nous utiliserons un préfixe :

```text
https://dougcosta.com/en/
https://dougcosta.com/en/blog/

https://dougcosta.com/fr/
https://dougcosta.com/fr/blog/

https://dougcosta.com/es/
https://dougcosta.com/es/blog/
```

Le même principe sera appliqué aux articles.

Par exemple, un même article peut avoir les URL suivantes :

```text
/blog/construindo-site-astro-github-pages/
/en/blog/building-a-site-with-astro-github-pages/
/fr/blog/creer-un-site-avec-astro-et-github-pages/
/es/blog/crear-un-sitio-con-astro-y-github-pages/
```

Cela permet d’avoir des URL distinctes pour chaque langue, plutôt que d’essayer de placer toutes les traductions sur une seule page.

## Configurer l’internationalisation dans Astro

La première étape consiste à indiquer à Astro quelles langues seront prises en charge.

Cette configuration se trouve dans le fichier :

```text
astro.config.mjs
```

La configuration est la suivante :

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

La propriété `defaultLocale` définit la langue par défaut du site.

Dans notre cas :

```text
pt-BR
```

Le tableau `locales`, quant à lui, répertorie toutes les langues disponibles.

La configuration :

```js
prefixDefaultLocale: false
```

est importante pour le comportement recherché. Elle signifie que la langue par défaut n’aura pas de préfixe dans l’URL.

Ainsi :

```text
/
```

représente le portugais, tandis que :

```text
/en/
/fr/
/es/
```

représentent les autres langues.

## Créer les fichiers de traduction

En plus du routage, nous devons traduire les textes qui composent l’interface du site.

Pour cela, nous allons créer une structure dédiée dans `src` :

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

Chaque fichier de langue contient les traductions correspondantes.

Par exemple, le fichier `pt-BR.ts` contient des textes tels que :

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

Le fichier anglais possède la même structure, mais avec les textes traduits :

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

L’avantage de cette approche est que les composants peuvent utiliser la même structure, quelle que soit la langue courante.

Elle permet également de centraliser les traductions au même endroit au lieu de les disperser dans le site. Ainsi, lorsqu’un texte est modifié dans ce fichier, toutes les pages et tous les composants qui utilisent cette traduction affichent automatiquement la nouvelle valeur.

L’ajout d’une nouvelle langue nécessite de mettre à jour la configuration d’Astro et les différents endroits du projet qui répertorient les locales prises en charge, ainsi que de créer les traductions et les routes correspondantes.

## Centraliser les langues

Après avoir créé les fichiers individuels, nous devons rendre les traductions accessibles de manière centralisée.

Pour cela, nous allons créer :

```text
src/i18n/index.ts
```

Le fichier importe tous les catalogues :

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

Ainsi, un composant peut simplement récupérer les traductions de la langue courante :

```ts
const t = getTranslations(locale);
```

Et utiliser :

```astro
{t.nav.blog}
```

au lieu d’écrire directement :

```astro
Blog
```

Cela permet de séparer les textes de l’interface de la structure des composants.

## Identifier la langue courante

Nous devons également déterminer quelle langue correspond à l’URL actuellement consultée.

Nous allons créer quelques utilitaires dans :

```text
src/i18n/utils.ts
```

Le premier identifie la langue à partir du premier segment de l’URL :

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
Comme le portugais est la langue par défaut et ne possède pas de préfixe dans l’URL, lorsque le premier segment ne correspond pas à une locale prise en charge, nous considérons qu’il s’agit de pt-BR.

Ainsi, une URL telle que :

```text
/en/blog/...
```

renvoie :

```text
en
```

Tandis que :

```text
/blog/...
```

renvoie :

```text
pt-BR
```

Le second est une fonction permettant d’obtenir le préfixe correspondant :

```ts
export function getLocalePrefix(locale: Locale): string {
	return locale === 'pt-BR' ? '' : `/${locale}`;
}
```

Cela permet de générer des URL sans avoir à disperser les règles de langue dans le projet.

Par exemple :

```ts
getLocalePrefix('pt-BR');
```

renvoie :

```text
''
```

Tandis que :

```ts
getLocalePrefix('en');
```

renvoie :

```text
/en
```

## Internationaliser le contenu du blog

L’interface n’est pas la seule partie qui doit être traduite.

Les articles eux-mêmes doivent également indiquer la langue qu’ils représentent et le contenu traduit auquel ils appartiennent.

Pour cela, ouvrons le fichier :
```bash
src/content.config.ts
```

Et ajoutons deux champs au schéma de la collection du blog :

```ts
lang: z.enum(['pt-BR', 'en', 'fr', 'es']),
translationKey: z.string(),
```

Cela donnera :
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

`lang` identifie la langue de l’article.

`translationKey`, quant à lui, sert d’identifiant partagé entre toutes les versions d’un même contenu.

Par exemple, l’article consacré à Astro utilise :

```yaml
lang: pt-BR
translationKey: astro-github-pages
```

La version anglaise utilise :

```yaml
lang: en
translationKey: astro-github-pages
```

La version française :

```yaml
lang: fr
translationKey: astro-github-pages
```

Et la version espagnole :

```yaml
lang: es
translationKey: astro-github-pages
```

Nous pouvons ainsi identifier ces fichiers comme différentes versions linguistiques d’un même contenu.

## Créer les fichiers traduits

Chaque version traduite possède son propre fichier de contenu.

La version originale se trouve dans :

```text
src/content/blog/construindo-site-astro-github-pages.md
```

La version anglaise :

```text
src/content/blog/building-a-site-with-astro-github-pages.md
```

La version française :

```text
src/content/blog/creer-un-site-avec-astro-et-github-pages.md
```

Et la version espagnole :

```text
src/content/blog/crear-un-sitio-con-astro-y-github-pages.md
```

Bien qu’il s’agisse de fichiers différents, ils utilisent tous la même `translationKey`.

Cela permet à Astro de traiter chaque fichier comme un article indépendant, tout en permettant à l’application de les associer en tant que traductions.

## Créer des utilitaires pour les articles

Une fois le schéma prêt, nous allons créer quelques fonctions pour travailler avec les articles.

Une règle importante de cette implémentation est que **toute liste d’articles doit être filtrée selon la locale de la page en cours de rendu**. Il ne suffit pas de créer des routes différentes pour chaque langue. Comme tous les articles se trouvent dans la même collection, les requêtes doivent sélectionner explicitement la bonne langue.

Le premier objectif est de pouvoir récupérer uniquement les articles d’une langue donnée.

Pour cela, nous allons créer la fonction `getPostsByLocale` dans les utilitaires dédiés aux articles, dans le fichier `src/utils/posts.ts` :
```ts
export function getPostsByLocale(
	posts: Post[],
	locale: Post['data']['lang'],
) {
	return posts.filter((post) => post.data.lang === locale);
}
```

C’est important, car un même projet peut contenir différentes versions linguistiques du contenu.

Par exemple, lorsque nous sommes sur la page d’accueil en anglais, nous ne voulons pas afficher les articles en portugais.

Nous pouvons faire :

```ts
const posts = getPostsByLocale(
	await getPublishedPosts(),
	'en',
);
```

Et obtenir uniquement les articles en anglais.

La même règle doit être appliquée aux pages de liste du blog, aux pages paginées et à tout autre écran affichant une collection d’articles. Ainsi, la séparation par langue ne se limite pas aux routes et est également respectée par les données affichées sur chaque page. Nous verrons plus loin comment ce mécanisme fonctionne.

Toujours dans le fichier `src/utils/posts.ts`, nous allons créer une fonction permettant de trouver la traduction correspondante d’un article :

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

La logique recherche un article ayant la même `translationKey`, vérifie qu’il existe dans la langue demandée et renvoie la traduction trouvée.

Cette fonction sera utilisée par le sélecteur de langue.

## Créer les routes pour chaque langue

L’étape suivante consiste à créer les pages correspondant aux différentes langues.

La structure du projet ressemble alors à ceci :

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

Nous allons créer un répertoire pour chaque langue (en, fr et es) dans `src/pages/`, puis y créer les pages correspondant aux routes que nous souhaitons proposer dans chaque langue. La structure rend explicite le fait que chaque langue possède ses propres pages.

La page :

```text
src/pages/index.astro
```

représente le portugais.

Tandis que :

```text
src/pages/en/index.astro
```

représente l’anglais.

Le même principe est utilisé pour le français et l’espagnol.

## Filtrer le blog par langue

Sur les pages qui affichent des listes d’articles, comme la page d’accueil et la liste du blog, nous utilisons la locale correspondant à chaque route.

Sur la page d’accueil en portugais :

```ts
const posts = getPostsByLocale(
	await getPublishedPosts(),
	'pt-BR',
);
```

Sur la page d’accueil en anglais :

```ts
const posts = getPostsByLocale(
	await getPublishedPosts(),
	'en',
);
```

Il en va de même pour le français et l’espagnol.

Cela garantit que la liste de chaque langue ne contient que les articles correspondants à cette langue.

Ce filtrage doit être effectué **avant la pagination**. Nous sélectionnons d’abord les articles de la locale courante, puis nous transmettons cette collection à la logique qui crée les pages paginées. Ainsi, le nombre d’articles par page et le nombre total de pages sont également calculés exclusivement à partir de la langue courante.

Cette règle s’applique à toutes les routes de liste : page d’accueil, blog et pages paginées. Chacune doit récupérer les articles publiés puis appliquer `getPostsByLocale()` avec la locale correspondant à sa propre route.

Cela devrait ressembler à ceci :
```astro
---
import Layout from '../layouts/Layout.astro';
import PostCard from '../components/PostCard.astro';
import { BLOG, SITE } from '../consts';
import { getTranslations } from '../i18n';
import { getPostsByLocale, getPublishedPosts } from '../utils/posts';

const t = getTranslations('pt-BR');

// Récupère uniquement les articles correspondant à la langue courante.
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
		<!-- Liste les articles de la langue courante. -->
		{posts.length ? posts.map((post) => <PostCard post={post} />) : <p class="empty">{t.home.empty}</p>}
	</section>
</Layout>
...
```

En plus d’améliorer l’expérience de navigation, cette séparation évite de mélanger des contenus dans différentes langues sur une même page et garantit une pagination cohérente avec la langue sélectionnée.

## Créer le sélecteur de langue

Une fois les articles associés grâce à la `translationKey`, nous pouvons créer le sélecteur de langue dans le header.

Pour cela, dans le fichier `src/components/Header.astro`, nous importons les utilitaires de traduction que nous avons créés :

```astro
---
import { getTranslations, type Locale } from '../i18n';
import { getLocaleFromUrl, getLocalePrefix } from '../i18n/utils';
import type { CollectionEntry } from 'astro:content';
import { getPublishedPosts, getTranslatedPost } from '../utils/posts';
...
```

Nous identifions la langue courante :

```ts
const locale = getLocaleFromUrl(Astro.url);
```

Nous chargeons les traductions de l’interface :

```ts
const t = getTranslations(locale);
```

Nous définissons les langues disponibles :

```ts
const languages: { locale: Locale; label: string }[] = [
	{ locale: 'pt-BR', label: 'PT' },
	{ locale: 'en', label: 'EN' },
	{ locale: 'fr', label: 'FR' },
	{ locale: 'es', label: 'ES' },
];
```

Nous calculons le préfixe correspondant à la langue courante :
```ts
const basePath = locale === 'pt-BR' ? '' : `/${locale}`;
```

Nous définissons les éléments du menu de navigation du site (qui permet de naviguer entre l’accueil, la liste des articles et la page À propos) :
```ts
const NAV = [
	{ href: `${basePath}/`, label: t.nav.home },
	{ href: `${basePath}/blog/`, label: t.nav.blog },
	{ href: `${basePath}/about/`, label: t.nav.about },
];
```

Nous créons une fonction qui génère le chemin correspondant à la langue sélectionnée :
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

Dans cette fonction, lorsque nous sommes sur un article, le sélecteur recherche la traduction correspondante :

```ts
const translatedPost = getTranslatedPost(
	posts,
	currentPost,
	targetLocale,
);
```

Si la traduction existe, nous générons l’URL de l’article traduit :

```ts
return `${getLocalePrefix(targetLocale)}/blog/${translatedPost.id}/`;
```

`basePath` représente le préfixe de la langue courante et est utilisé pour les liens fixes du menu. `getLocalePrefix()`, quant à lui, est utilisé lorsque nous devons générer une URL pour une langue cible.

Ainsi, si nous lisons la version portugaise et sélectionnons l’anglais, la navigation nous mène directement vers la version anglaise du même article.

Si une traduction n’existe pas encore, le sélecteur peut rediriger le lecteur vers la liste du blog dans cette langue.

Dans le `header`, nous utilisons désormais `basePath`, qui contient le chemin de base courant de la page :
```astro
<a class="brand" href={`${basePath}/`}>{SITE.title}</a>
```

Et nous ajoutons un sélecteur de langue dans le header :
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

Le sélecteur de langue doit également fonctionner sur les pages qui ne sont pas des articles.

Dans ce cas, il n’existe pas de `translationKey` à utiliser.

L’application conserve donc le chemin actuel et remplace uniquement le préfixe de la langue.

Par exemple :

```text
/blog/
```

peut être converti en :

```text
/en/blog/
```

ou :

```text
/fr/blog/
```

Cela garantit une navigation cohérente sur l’ensemble du site.

## Mettre à jour le layout

Le layout principal doit également connaître la langue courante.

Dans `Layout.astro`, nous utilisons :

```ts
const locale = getLocaleFromUrl(Astro.url);
const t = getTranslations(locale);
```

La langue est également appliquée à l’élément `<html>` :

```astro
<html lang={locale}>
```

Ainsi, une page en portugais aura :

```html
<html lang="pt-BR">
```

et une page en anglais :

```html
<html lang="en">
```

En plus d’être sémantiquement correct, cela fournit au navigateur et aux autres outils une information explicite sur la langue du contenu.

## Mettre à jour les liens des articles

Il reste un autre point important lorsque l’on commence à travailler avec plusieurs langues.

Les cartes du blog sont des composants partagés par toutes les pages.

Le lien vers l’article ne peut donc pas être défini en dur comme ceci :

```astro
<a href={`/blog/${post.id}/`}>
```

Sur une page en anglais, par exemple, nous devons générer :

```text
/en/blog/...
```

Pour résoudre ce problème, nous récupérons la langue courante dans les composants `src/components/PostCard.astro` et `src/layouts/BlogPost.astro` :

```ts
const locale = getLocaleFromUrl(Astro.url);
const localePrefix = getLocalePrefix(locale);
```

Pour le préfixe de l’URL, nous utilisons la valeur stockée dans `localePrefix` :

```astro
<a href={`${localePrefix}/blog/${post.id}/`}>
	{title}
</a>
```

Comme le préfixe du portugais est une chaîne vide, le comportement reste :

```text
/blog/...
```

Les autres langues reçoivent quant à elles leurs préfixes respectifs :

```text
/en/blog/...
/fr/blog/...
/es/blog/...
```

Nous pouvons ainsi réutiliser le même composant pour toutes les versions du site.

## Conserver les liens des tags dans la bonne langue

Les tags font également partie de la navigation du blog et doivent respecter la locale courante.

Comme les tags sont réutilisés par les articles de toutes les langues, nous ne devons pas toujours générer leur lien à partir de la route par défaut :

```astro
<a href={`/tags/${tagSlug(tag)}/`}>
	#{tag}
</a>
```

Sur une page en anglais, par exemple, ce code mènerait vers :

```text
/tags/astro/
```

alors que le lien correct est :

```text
/en/tags/astro/
```

Dans les composants `src/components/PostCard.astro` et `src/layouts/BlogPost.astro`, nous allons modifier les liens des tags afin d’utiliser le préfixe stocké dans `localePrefix`. Le lien devient :

```astro
<a href={`${localePrefix}/tags/${tagSlug(tag)}/`}>
	#{tag}
</a>
```

Ainsi, les composants responsables du rendu des tags peuvent générer correctement les liens dans toutes les langues :

```text
/tags/astro/
/en/tags/astro/
/fr/tags/astro/
/es/tags/astro/
```

La même attention doit être portée aux autres liens générés dans les composants partagés. Chaque fois qu’une URL dépend de la langue courante, le composant doit récupérer la locale de l’URL actuelle et utiliser le préfixe correspondant, plutôt que de supposer que la route par défaut est toujours `/`.

## Résultat final

Après ces modifications, nous obtenons une structure dans laquelle la langue est prise en compte dans toutes les parties importantes du site.

La page d’accueil possède une version pour chaque langue :

```text
/
/en/
/fr/
/es/
```

Le blog également :

```text
/blog/
/en/blog/
/fr/blog/
/es/blog/
```

Et chaque article peut disposer de sa propre version traduite :

```text
/blog/artigo-em-portugues/
/en/blog/article-in-english/
/fr/blog/article-en-francais/
/es/blog/articulo-en-espanol/
```

La relation entre ces versions est assurée par `translationKey`.

Cela permet à l’utilisateur de passer d’une traduction à l’autre sans avoir à rechercher manuellement le contenu correspondant.


## Conclusion

Internationaliser le site ne signifie pas seulement traduire les textes de l’interface.

Il a fallu réfléchir à la structure dans son ensemble : URL, contenu, listes, navigation et relation entre les traductions. Chaque page doit afficher uniquement le contenu de sa locale, et les liens générés par les composants partagés doivent eux aussi préserver ce contexte.

La configuration i18n d’Astro a défini les règles de routage par langue, tandis que la structure des pages et les utilitaires du projet se sont chargés de générer ces routes et de permettre la navigation entre elles.

Pour le contenu du blog, la combinaison de `lang` et `translationKey` fournit un moyen simple d’identifier la langue de chaque article et d’associer les différentes versions d’un même contenu.

Au final, nous disposons d’une seule application Astro capable de publier le même site en quatre langues, avec des URL propres à chaque langue, des listes séparées, une navigation localisée et la possibilité pour le lecteur de passer d’une traduction à l’autre.

La structure prépare également le projet à évoluer. Lorsque de nouveaux articles seront publiés, il suffira de créer leurs versions dans les langues souhaitées et d’utiliser la même `translationKey` pour les associer.

## Liens utiles

Si vous n'avez pas encore de site et souhaitez en créer un avec Astro, vous pouvez également consulter l'article :

- [Créer un site avec Astro et le publier sur GitHub Pages avec GitHub Actions](../creer-un-site-avec-astro-et-github-pages/)

Si vous utilisez Astro et que, comme moi, vous souhaitez que les liens externes de votre site s'ouvrent dans un nouvel onglet, découvrez comment j'ai mis en place cette fonctionnalité dans l'article :

- [Ouvrir les liens externes des articles dans un nouvel onglet avec Astro](../astro-liens-dans-un-nouvel-onglet/)

Si vous souhaitez configurer Google Analytics sur un site, consultez également l’article :

- [Configurer Google Analytics sur un site](../configurer-google-analytics-sur-un-site-web/)

## Références

L’implémentation présentée dans cet article s’appuie principalement sur la documentation officielle d’Astro :

- [Internationalization (i18n) Routing — Astro Documentation](https://docs.astro.build/en/guides/internationalization/)
- [Configuration Reference — Astro Documentation](https://docs.astro.build/en/reference/configuration-reference/)
- [Content Collections — Astro Documentation](https://docs.astro.build/en/guides/content-collections/)
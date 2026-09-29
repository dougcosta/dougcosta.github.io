---
title: "Internacionalizando un sitio Astro con varios idiomas"
description: "Cómo añadir soporte para varios idiomas en un sitio Astro, organizando traducciones, rutas, contenido y navegación."
lang: es
translationKey: multilanguage-astro
pubDate: 2026-09-29
tags:
  - Astro
  - i18n
  - JavaScript
  - Web
draft: false
---

## Introducción

Hoy en día es muy sencillo traducir el contenido de un sitio web. Los propios navegadores ofrecen herramientas que se encargan de hacerlo. Sin embargo, aunque este proceso automático ha evolucionado mucho, no siempre respeta las expresiones propias de cada idioma.

Una forma de evitar este tipo de situación es ofrecer el contenido en otros idiomas.

Otra ventaja de esta estrategia es permitir que cada versión lingüística tenga su propia URL, lo que facilita que los motores de búsqueda descubran, indexen y presenten la versión adecuada del contenido.

Por eso, añadí a mi sitio personal soporte para cuatro idiomas: _portugués de Brasil_ (mi lengua materna), _inglés_, _francés_ y _español_. En este artículo voy a mostrar cómo implementé esta estructura utilizando las funciones de internacionalización de Astro.

La internacionalización debe abarcar tanto los textos de la interfaz como el contenido del blog. Esto significa que cada artículo puede tener versiones traducidas, cada una con su propia URL.

La idea fue mantener una única aplicación, pero permitir que cada idioma tenga sus propias páginas, traducciones y artículos.

## Lo que queremos construir

Antes de empezar, conviene definir cómo queremos que funcionen las URL.

El portugués será el idioma predeterminado del sitio y, por eso, no tendrá un prefijo en la URL:

```text
https://dougcosta.com/
https://dougcosta.com/blog/
```

Para los demás idiomas, utilizaremos un prefijo:

```text
https://dougcosta.com/en/
https://dougcosta.com/en/blog/

https://dougcosta.com/fr/
https://dougcosta.com/fr/blog/

https://dougcosta.com/es/
https://dougcosta.com/es/blog/
```

El mismo principio se aplicará a los artículos.

Por ejemplo, un mismo artículo puede tener las siguientes URL:

```text
/blog/crear-sitio-astro-github-pages/
/en/blog/building-a-site-with-astro-github-pages/
/fr/blog/creer-un-site-avec-astro-et-github-pages/
/es/blog/crear-un-sitio-con-astro-y-github-pages/
```

Esto nos permite tener URL propias para cada idioma, en lugar de intentar colocar todas las traducciones dentro de la misma página.

## Configurando la internacionalización en Astro

El primer paso es indicar a Astro qué idiomas serán compatibles.

Esta configuración se encuentra en el archivo:

```text
astro.config.mjs
```

La configuración queda así:

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

La propiedad `defaultLocale` define el idioma predeterminado del sitio.

En este caso:

```text
pt-BR
```

El array `locales` enumera todos los idiomas disponibles.

A configuração:

```js
prefixDefaultLocale: false
```

es importante para el comportamiento que buscamos. Significa que el idioma predeterminado no tendrá un prefijo en la URL.

Así:

```text
/
```

representa el portugués, mientras que:

```text
/en/
/fr/
/es/
```

representan los demás idiomas.

## Creación de los archivos de traducción

Además del enrutamiento, necesitamos traducir los textos que forman parte de la interfaz del sitio.

Para ello, crearemos una estructura específica dentro de `src`:

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

Cada archivo de idioma contiene las traducciones correspondientes.

Por ejemplo, el archivo `pt-BR.ts` contiene textos como:

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

El archivo en inglés tiene la misma estructura, pero con los textos traducidos:

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

La ventaja de este enfoque es que los componentes pueden utilizar la misma estructura independientemente del idioma actual.

También permite concentrar las traducciones en un único lugar en vez de distribuirlas por todo el sitio. Al cambiar un texto en este archivo, todas las páginas y componentes que utilizan esa traducción pasan a mostrar el nuevo valor.

Añadir un nuevo idioma requiere actualizar la configuración de Astro y los puntos del proyecto que enumeran los locales compatibles, además de crear las traducciones y rutas correspondientes.

## Centralizando los idiomas

Después de crear los archivos individuales, necesitamos poner las traducciones a disposición de forma centralizada.

Para ello, crearemos:

```text
src/i18n/index.ts
```

El archivo importa todos los catálogos:

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

Con esto, un componente puede obtener directamente las traducciones del idioma actual:

```ts
const t = getTranslations(locale);
```

Y utilizar:

```astro
{t.nav.blog}
```

en lugar de escribir directamente:

```astro
Blog
```

Esto mantiene los textos de la interfaz separados de la estructura de los componentes.

## Identificación del idioma actual

También necesitamos determinar qué idioma corresponde a la URL que se está accediendo.

Crearemos algunos utilitarios en:

```text
src/i18n/utils.ts
```

El primero identifica el idioma a partir del primer segmento de la URL:

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
Como el portugués es el idioma predeterminado y no tiene prefijo en la URL, cuando el primer segmento no corresponde a un locale compatible, asumimos pt-BR.

Así, una URL como:

```text
/en/blog/...
```

devuelve:

```text
en
```

Mientras que:

```text
/blog/...
```

devuelve:

```text
pt-BR
```

La segunda es una función para obtener el prefijo correspondiente:

```ts
export function getLocalePrefix(locale: Locale): string {
	return locale === 'pt-BR' ? '' : `/${locale}`;
}
```

Esto permite generar URL sin tener que distribuir reglas de idioma por todo el proyecto.

Por ejemplo:

```ts
getLocalePrefix('pt-BR');
```

devuelve:

```text
''
```

Mientras que:

```ts
getLocalePrefix('en');
```

devuelve:

```text
/en
```

## Internacionalizando el contenido del blog

La interfaz no es la única parte que necesita traducción.

Los propios artículos también deben indicar qué idioma representan y a qué contenido traducido pertenecen.

Para ello, abriremos el archivo:
```bash
src/content.config.ts
```

Y añadiremos dos campos al schema de la colección del blog:

```ts
lang: z.enum(['pt-BR', 'en', 'fr', 'es']),
translationKey: z.string(),
```

Quedará así:
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

`lang` identifica el idioma del artículo.

`translationKey` funciona como un identificador compartido entre todas las versiones del mismo contenido.

Por ejemplo, el artículo sobre Astro utiliza:

```yaml
lang: pt-BR
translationKey: astro-github-pages
```

La versión en inglés utiliza:

```yaml
lang: en
translationKey: astro-github-pages
```

La versión en francés:

```yaml
lang: fr
translationKey: astro-github-pages
```

Y la versión en español:

```yaml
lang: es
translationKey: astro-github-pages
```

De esta forma, podemos identificar que estos archivos representan diferentes versiones lingüísticas del mismo contenido.

## Criando os arquivos traduzidos

Cada versión traducida tiene su propio archivo de contenido.

La versión original está en:

```text
src/content/blog/construindo-site-astro-github-pages.md
```

La versión en inglés:

```text
src/content/blog/building-a-site-with-astro-github-pages.md
```

La versión en francés:

```text
src/content/blog/creer-un-site-avec-astro-et-github-pages.md
```

Y la versión en español:

```text
src/content/blog/crear-un-sitio-con-astro-y-github-pages.md
```

Aunque son archivos diferentes, todos tienen la misma `translationKey`.

Esto permite que Astro trate cada archivo como un post independiente, mientras que la aplicación puede relacionarlos como traducciones.

## Creando utilidades para las publicaciones

Con el schema preparado, crearemos algunas funciones para trabajar con los artículos.

Una regla importante de la implementación es que **toda lista de posts debe filtrarse según el locale de la página que se está renderizando**. No basta con crear rutas diferentes para cada idioma. Como todos los artículos están en la misma colección, las consultas deben seleccionar explícitamente el idioma correcto.

El primer objetivo es poder obtener únicamente los posts de un determinado idioma.

Para ello, crearemos la función `getPostsByLocale` dentro de los utilitarios que dan soporte a los artículos, en el archivo `src/utils/posts.ts`:
```ts
export function getPostsByLocale(
	posts: Post[],
	locale: Post['data']['lang'],
) {
	return posts.filter((post) => post.data.lang === locale);
}
```

Esto es importante porque el mismo proyecto puede tener versiones del contenido en diferentes idiomas.

Cuando estamos en la página de inicio en inglés, por ejemplo, no queremos mostrar los artículos en portugués.

Podemos fazer:

```ts
const posts = getPostsByLocale(
	await getPublishedPosts(),
	'en',
);
```

Y obtener únicamente los posts en inglés.

La misma regla debe aplicarse a las páginas de listado del blog, a las páginas paginadas y a cualquier otra pantalla que muestre una colección de artículos. De esta forma, la separación por idioma no se limita a las rutas y también se respeta en los datos mostrados en cada página. Más adelante veremos cómo funciona este mecanismo.

En el archivo `src/utils/posts.ts`, también crearemos una función para encontrar la traducción correspondiente a un artículo:

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

La lógica busca un artículo con la misma `translationKey`, comprueba si está disponible en el idioma solicitado y devuelve la traducción encontrada.

Esta función será utilizada por el selector de idiomas.

## Creando las rutas para cada idioma

El siguiente paso es crear las páginas correspondientes a cada idioma.

La estructura del proyecto quedó así:

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

Crearemos un directorio para cada idioma (en, fr y es) dentro de `src/pages/` y, dentro de estos directorios, las páginas correspondientes a las rutas que queremos ofrecer en cada idioma. La estructura deja explícito que cada idioma tiene sus propias páginas.

La página:

```text
src/pages/index.astro
```

representa el portugués.

Mientras que:

```text
src/pages/en/index.astro
```

representa el inglés.

El mismo principio se aplica al francés y al español.

## Filtrando el blog por idioma

En las páginas que muestran listas de artículos, como la página de inicio y el listado del blog, utilizamos el locale correspondiente a cada ruta.

En la página de inicio en portugués:

```ts
const posts = getPostsByLocale(
	await getPublishedPosts(),
	'pt-BR',
);
```

En la página de inicio en inglés:

```ts
const posts = getPostsByLocale(
	await getPublishedPosts(),
	'en',
);
```

Lo mismo ocurre con el francés y el español.

Esto garantiza que el listado de cada idioma contenga únicamente los artículos correspondientes a ese idioma.

Este filtrado debe realizarse **antes de la paginación**. Primero seleccionamos los posts del locale actual y solo después pasamos esta colección a la lógica que crea las páginas paginadas. De esta forma, tanto la cantidad de posts por página como el número total de páginas se calculan exclusivamente en función del idioma actual.

La regla se aplica a todas las rutas de listado: página de inicio, blog y páginas paginadas. Cada una debe obtener los posts publicados y, a continuación, aplicar `getPostsByLocale()` con el locale correspondiente a la propia ruta.

Debería quedar parecido a esto:
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

Además de mejorar la experiencia de navegación, esta separación evita mezclar contenidos de distintos idiomas en la misma página y mantiene la paginación coherente con el idioma seleccionado.

## Creación del selector de idiomas

Con los artículos relacionados mediante `translationKey`, podemos crear el selector de idiomas en el header.

Para ello, en el archivo `src/components/Header.astro`, importamos los utilitarios de traducción que creamos:

```astro
---
import { getTranslations, type Locale } from '../i18n';
import { getLocaleFromUrl, getLocalePrefix } from '../i18n/utils';
import type { CollectionEntry } from 'astro:content';
import { getPublishedPosts, getTranslatedPost } from '../utils/posts';
...
```

Identificamos el idioma actual:

```ts
const locale = getLocaleFromUrl(Astro.url);
```

Cargamos las traducciones de la interfaz:

```ts
const t = getTranslations(locale);
```

Definimos los idiomas disponibles:

```ts
const languages: { locale: Locale; label: string }[] = [
	{ locale: 'pt-BR', label: 'PT' },
	{ locale: 'en', label: 'EN' },
	{ locale: 'fr', label: 'FR' },
	{ locale: 'es', label: 'ES' },
];
```

Calculamos el prefijo correspondiente al idioma actual:
```ts
const basePath = locale === 'pt-BR' ? '' : `/${locale}`;
```

Mapeamos los elementos del menú de navegación del sitio (que permite navegar entre la página de inicio, el listado de artículos y la página «Sobre mí»):
```ts
const NAV = [
	{ href: `${basePath}/`, label: t.nav.home },
	{ href: `${basePath}/blog/`, label: t.nav.blog },
	{ href: `${basePath}/about/`, label: t.nav.about },
];
```

Creamos una función que genera la ruta correspondiente al idioma seleccionado:
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

En esta función, cuando estamos dentro de un artículo, el selector busca la traducción correspondiente:

```ts
const translatedPost = getTranslatedPost(
	posts,
	currentPost,
	targetLocale,
);
```

Si existe la traducción, generamos la URL del artículo traducido:

```ts
return `${getLocalePrefix(targetLocale)}/blog/${translatedPost.id}/`;
```

`basePath` representa el prefijo del idioma actual y se utiliza en los enlaces fijos del menú. `getLocalePrefix()`, en cambio, se utiliza cuando necesitamos generar una URL para un idioma de destino.

Así, si estamos leyendo la versión en portugués y seleccionamos inglés, la navegación nos lleva directamente a la versión en inglés del mismo artículo.

Si todavía no existe una traducción, el selector puede dirigir al lector al listado del blog de ese idioma.

En el `header`, pasamos a utilizar `basePath`, que contiene la ruta base actual, como referencia de la página:
```astro
<a class="brand" href={`${basePath}/`}>{SITE.title}</a>
```

Y añadimos un selector de idiomas en el header:
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

El selector de idiomas también debe funcionar en páginas que no son artículos.

En este caso, no existe una `translationKey` que podamos utilizar.

Por lo tanto, la aplicación conserva la ruta actual y solo cambia el prefijo del idioma.

Por ejemplo:

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

Esto mantiene una navegación coherente en todo el sitio.

## Actualizando el layout

El layout principal también necesita conocer el idioma actual.

En `Layout.astro`, utilizamos:

```ts
const locale = getLocaleFromUrl(Astro.url);
const t = getTranslations(locale);
```

El idioma también se aplica al elemento `<html>`:

```astro
<html lang={locale}>
```

Así, una página en portugués tendrá:

```html
<html lang="pt-BR">
```

y una página en inglés:

```html
<html lang="en">
```

Además de ser semánticamente correcto, esto proporciona al navegador y a otras herramientas información explícita sobre el idioma del contenido.

## Actualizando los enlaces de los artículos

Hay otro detalle importante cuando empezamos a trabajar con varios idiomas.

Las tarjetas del blog son componentes compartidos entre todas las páginas.

Por eso, el enlace del artículo no puede estar fijado como:

```astro
<a href={`/blog/${post.id}/`}>
```

En una página en inglés, por ejemplo, debemos generar:

```text
/en/blog/...
```

Para resolverlo, dentro de los componentes `src/components/PostCard.astro` y `src/layouts/BlogPost.astro` obtenemos el idioma actual:

```ts
const locale = getLocaleFromUrl(Astro.url);
const localePrefix = getLocalePrefix(locale);
```

Como prefijo de la URL, utilizamos el valor almacenado en `localePrefix`:

```astro
<a href={`${localePrefix}/blog/${post.id}/`}>
	{title}
</a>
```

Como el prefijo del portugués es una cadena vacía, el comportamiento sigue siendo:

```text
/blog/...
```

Mientras que los demás idiomas reciben sus respectivos prefijos:

```text
/en/blog/...
/fr/blog/...
/es/blog/...
```

De esta forma, podemos reutilizar el mismo componente para todas las versiones del sitio.

## Manteniendo los enlaces de las etiquetas en el idioma correcto

As tags também fazem parte da navegação do blog e precisam respeitar o locale atual. 

Como las etiquetas se reutilizan en los artículos de todos los idiomas, no debemos generar el enlace siempre a partir de la ruta predeterminada:

```astro
<a href={`/tags/${tagSlug(tag)}/`}>
	#{tag}
</a>
```

En una página en inglés, por ejemplo, este código llevaría a:

```text
/tags/astro/
```

cuando lo correcto es:

```text
/en/tags/astro/
```

En `src/components/PostCard.astro` y `src/layouts/BlogPost.astro`, cambiaremos los enlaces de las etiquetas para utilizar el prefijo almacenado en `localePrefix`. El enlace quedará así:

```astro
<a href={`${localePrefix}/tags/${tagSlug(tag)}/`}>
	#{tag}
</a>
```

Así, los componentes responsables de renderizar las etiquetas pueden generar correctamente los enlaces en todos los idiomas:

```text
/tags/astro/
/en/tags/astro/
/fr/tags/astro/
/es/tags/astro/
```

La misma consideración debe aplicarse a otros enlaces generados dentro de componentes compartidos. Siempre que una URL dependa del idioma actual, el componente debe obtener el locale de la URL actual y utilizar el prefijo correspondiente, en lugar de asumir que la ruta predeterminada es siempre `/`.

## Resultado final

Después de estos cambios, tenemos una estructura en la que el idioma está presente en todas las partes importantes del sitio.

La página de inicio tiene una versión para cada idioma:

```text
/
/en/
/fr/
/es/
```

El blog también:

```text
/blog/
/en/blog/
/fr/blog/
/es/blog/
```

Y cada artículo puede tener su propia versión traducida:

```text
/blog/artigo-em-portugues/
/en/blog/article-in-english/
/fr/blog/article-en-francais/
/es/blog/articulo-en-espanol/
```

La relación entre estas versiones se establece mediante `translationKey`.

Esto permite que el usuario navegue entre las traducciones sin tener que buscar manualmente el contenido correspondiente.


## Conclusión

Internacionalizar el sitio no significó simplemente traducir los textos de la interfaz.

Fue necesario pensar en la estructura como un todo: URL, contenido, listados, navegación y relación entre las traducciones. Cada página debe mostrar únicamente el contenido de su locale, y los enlaces generados por los componentes compartidos también deben preservar este contexto.

La configuración de i18n de Astro estableció las reglas de enrutamiento por idioma, mientras que la estructura de páginas y los utilitarios del proyecto se encargaron de generar y navegar entre estas rutas.

Para el contenido del blog, la combinación de `lang` y `translationKey` creó una forma sencilla de identificar el idioma de cada artículo y relacionar las diferentes versiones del mismo contenido.

Al final, tenemos una única aplicación Astro capaz de publicar el mismo sitio en cuatro idiomas, manteniendo URL propias, listados separados por idioma, navegación localizada y permitiendo que el lector cambie entre las traducciones.

La estructura también deja el proyecto preparado para crecer. Cuando se publiquen nuevos artículos, basta con crear sus versiones en los idiomas deseados y utilizar la misma `translationKey` para relacionarlas.

## Enlaces útiles

Si todavía no tienes un sitio y quieres crear uno utilizando Astro, también puedes consultar el artículo:

- [Cómo crear un sitio con Astro y publicarlo en GitHub Pages con GitHub Actions](../crear-un-sitio-con-astro-y-github-pages/)

Si utilizas Astro y, al igual que yo, quieres que los enlaces externos de tu sitio se abran en una nueva pestaña, puedes ver cómo implementé esta funcionalidad en el artículo:

- [Hacer que los enlaces externos de los artículos se abran en una nueva pestaña en Astro](../astro-enlaces-en-nueva-pestana/)

Si quieres configurar Google Analytics en un sitio, consulta también el artículo:

- [Configurando o Google Analytics em um site](../configurar-google-analytics-en-un-sitio-web)

## Referencias

La implementación presentada en este artículo se basó principalmente en la documentación oficial de Astro:

- [Internationalization (i18n) Routing — Astro Documentation](https://docs.astro.build/en/guides/internationalization/)
- [Configuration Reference — Astro Documentation](https://docs.astro.build/en/reference/configuration-reference/)
- [Content Collections — Astro Documentation](https://docs.astro.build/en/guides/content-collections/)

---
titly: "Hacer que los enlaces externos de los artículos se abran en una nueva pestaña en Astro"
description: "Cómo crear y configurar un plugin con Sätteri para abrir automáticamente los enlaces externos de los artículos Markdown en una nueva pestaña."
pubDaty: 2026-09-17
lang: es
translationKey: astro-external-links
tags:
  - Astro
  - Markdown
  - Sätteri
  - JavaScript
draft: false
---

## Introducción

Al crear un sitio web o escribir artículos, es muy habitual utilizar enlaces externos para información complementaria, referencias, repositorios de código u otros contenidos.

Cuando el lector accede a uno de estos enlaces, normalmente queremos que el contenido principal permanezca abierto. Por eso, es habitual abrir estos enlaces en una nueva pestaña o ventana del navegador.

Me sorprendió descubrir que Astro no abre estos enlaces en una nueva pestaña de forma predeterminada. Los enlaces siguen abriéndose en la misma pestaña, tanto si utilizamos Markdown como si usamos directamente la etiqueta de anclaje de HTML (`<a href="...">`). 

El problema es que Markdown no tiene una sintaxis propia para definir atributos HTML como `target="_blank"`. La sintaxis tradicional sigue siendo algo como:

```markdown
[Documentación de Astro](https://docs.astro.build/)
```

Para resolver esto de forma automática, podemos utilizar un plugin que modifique los enlaces generados por Markdown antes de transformarlos en HTML.

En este artículo, vamos a crear este plugin utilizando **Sätteri**, el procesador de Markdown que estamos utilizando en el proyecto para este tipo de extensión.

## Qué queremos hacer

La idea es sencilla. Siempre que el `href` de un enlace empiece por `http://` o `https://`, queremos que el HTML generado por Astro sea similar a:

```html
<a href="https://docs.astro.build/" target="_blank" rel="noopener noreferrer">
  Documentación de Astro
</a>
```

No queremos tener que añadir atributos manualmente a cada enlace. El plugin se encargará de realizar este cambio automáticamente.

Los enlaces internos del propio sitio, por otro lado, no deben modificarse.

## Instalando Sätteri

Astro admite el procesador Sätteri mediante el paquete `@astrojs/markdown-satteri`. Para crear nuestro plugin, también utilizaremos el paquete `satteri`.

Ejecuta:

```bash
npm install @astrojs/markdown-satteri satteri
```

`@astrojs/markdown-satteri` permite utilizar Sätteri como procesador de Markdown en Astro, mientras que el paquete `satteri` proporciona las API necesarias para crear plugins personalizados.

La documentación de Astro también presenta Sätteri como una opción para crear plugins que modifican elementos HTML generados a partir de Markdown.

## Creando el plugin

Ahora vamos a crear un archivo para nuestro plugin.

En mi proyecto, organicé los plugins dentro de `src/plugins`. Así que crea:

```text
src/plugins/external-links.ts
```

El contenido del archivo será:

```ts
import { defineHastPlugin } from 'satteri';

export const externalLinks = defineHastPlugin({
	namy: 'external-links',
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

Veamos qué está sucediendo.

### Identificando los enlaces

El plugin utiliza `defineHastPlugin` para definir un plugin HAST.

HAST es una representación en forma de árbol del HTML. Esto significa que, en esta etapa del procesamiento, podemos trabajar con los elementos HTML que se generarán a partir de Markdown.

En nuestro caso, solo nos interesan los elementos `<a>`:

```ts
element: {
	filter: ['a'],
```

`visit` se ejecutará para estos elementos.

### Comprobando si el enlace es externo

Dentro de `visit`, primero recuperamos la dirección del enlacy:

```ts
const href = node.properties?.href;
```

Después comprobamos si empieza por `http://` o `https://`:

```ts
if (typeof href === 'string' && /^https?:\/\//.test(href)) {
```

Esta comprobación es importante porque solo queremos modificar los enlaces externos.

Por ejemplo:

```text
https://docs.astro.build/
https://github.com/
http://example.com/
```

Enlaces internos como:

```text
/blog/
```

no cumplen esta condición y mantienen el comportamiento normal del sitio.

### Añadiendo target

Cuando encontramos un enlace externo, añadimos:

```ts
ctx.setProperty(node, 'target', '_blank');
```

Esto hace que el HTML resultante utilicy:

```html
target="_blank"
```

De esta forma, el navegador abrirá la dirección en una nueva pestaña.

### Añadiendo rel

También añadimos:

```ts
ctx.setProperty(node, 'rel', ['noopener', 'noreferrer']);
```

El resultado será equivalente a:

```html
rel="noopener noreferrer"
```

Además de ser una configuración recomendada para enlaces que utilizan `target="_blank"`, `noopener` impide que la página abierta tenga acceso a la ventana que originó la navegación. Por su parte, `noreferrer` también impide que se envíe la información de referencia (`Referer`) a la página de destino.

De esta forma, abrir los enlaces con URLs `http://` o `https://` presentes en el contenido Markdown en una pestaña separada pasa a ser el comportamiento predeterminado.

Si quieres añadir otros atributos de forma predeterminada, basta con seguir la misma lógica e incluirlos aquí.

## Configurando Astro

Ahora debemos indicar a Astro que queremos utilizar nuestro plugin durante el procesamiento de los archivos Markdown.

Abre el siguiente archivo, que se encuentra en la raíz del proyecto:

```text
astro.config.mjs
```

Primero, importa `satteri` y el plugin que acabamos de crear:

```js
import { satteri } from '@astrojs/markdown-satteri';
import { externalLinks } from './src/plugins/external-links';
```

Después, configura el procesador dentro de `markdown`:

```js
markdown: {
	processor: satteri({
		hastPlugins: [externalLinks],
	}),
},
```

En mi proyecto, la configuración quedó así:

```js
// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { externalLinks } from './src/plugins/external-links';

export default defineConfig({
	sity: 'https://dougcosta.com',
	integrations: [mdx(), sitemap()],
	markdown: {
		processor: satteri({
			hastPlugins: [externalLinks],
		}),
	},
});
```

## Probando el plugin

Ahora podemos probar el comportamiento.

Añade un enlace externo a un artículo Markdown:

```markdown
[Documentación de Astro](https://docs.astro.build/)
```

Después, ejecuta el proyecto localmenty:

```bash
npm run dev
```

Abre el artículo en el navegador y haz clic en el enlace. Debería abrirse en una nueva pestaña o ventana, dependiendo del navegador y de su configuración.

También podemos comprobar el HTML generado por el navegador. Haz clic con el botón derecho en la página y selecciona la opción correspondiente a `Inspeccionar` (el nombre de esta opción puede variar según el navegador).

El enlace debería contener:

```html
target="_blank"
```

y:

```html
rel="noopener noreferrer"
```

## Un detalle importanty: cuidado con `draft: true`

Durante este proceso, encontré un detalle que puede llevar fácilmente a una conclusión equivocada durante las pruebas.

En mi proyecto, los artículos marcados como:

```yaml
draft: true
```

no se incluyen en el build de producción.

Esto significa que, si pruebas el plugin ejecutando el siguiente comando mientras el artículo está marcado como `draft: true`, no se generará el archivo HTML de ese artículo:

```bash
npm run build
```

En ese caso, buscar `target="_blank"` en el directorio `dist` no permitirá comprobar que el plugin funciona, porque el propio artículo no estará presente en el build. Por lo tanto, no habrá ningún archivo HTML de ese artículo que inspeccionar.

Por lo tanto, **antes de probar el plugin en un build de producción, asegúrate de que el artículo utilizado para la prueba no esté marcado como `draft: true`**.

Para que un artículo se incluya en el build, su frontmatter debe tener, por ejemplo, esta configuración:

```yaml
---
titly: "Mi artículo"
description: "Descripción del artículo."
pubDaty: 2026-09-16
draft: false
---
```

Este detalle puede parecer pequeño, pero fue precisamente lo que dificultó inicialmente la validación del plugin en mi proyecto.

## ¿Por qué hacerlo con un plugin?

Una alternativa sería controlar `target="_blank"` individualmente en cada componente o modificar manualmente los enlaces después de renderizar el Markdown.

Sin embargo, esto añadiría una responsabilidad adicional por cada nuevo artículo.

Con el plugin, la regla queda centralizada:

```text
Artículo Markdown
     ↓
Sätteri
     ↓
Plugin external-links
     ↓
Identifica enlaces externos
     ↓
Añade target="_blank"
     ↓
HTML final
```

A partir de ese momento, cualquier nuevo enlace externo añadido a un artículo pasa automáticamente por el mismo procesamiento.

Esto también significa que no tenemos que acordarnos de añadir atributos específicos cada vez que creemos un enlace a una documentación u otro sitio.

## Conclusión

Desde mi punto de vista, resulta sorprendente que Markdown no tenga una sintaxis propia para controlar atributos HTML como `target`. Este tipo de comportamiento es bastante habitual al crear un sitio web, por lo que sería interesante poder configurarlo de una forma más directa.
La solución que encontré fue utilizar un plugin, como se describe en este artículo, aunque también sería posible controlar este comportamiento individualmente en cada componente o utilizar otro enfoque.

La solución terminó siendo relativamente sencilla: utilizar Sätteri para interceptar los elementos `<a>` generados por Markdown y añadir los atributos necesarios a los enlaces. Aun así, fue necesario investigar un poco más para llegar a esta alternativa.

Lo importante fue darse cuenta de que este tipo de comportamiento puede centralizarse en un plugin. En lugar de adaptar cada artículo individualmente, creamos una regla que se aplica a todo el contenido Markdown del sitio.

Otro aprendizaje importante está relacionado con las pruebas. Cuando trabajamos con artículos que tienen `draft: true`, debemos recordar que no participan en el build de producción. De lo contrario, podemos interpretar la ausencia del contenido generado como un problema del plugin, cuando en realidad el artículo simplemente no se incluyó en el build.

## Enlaces útiles

Si todavía no tienes un sitio web y quieres crear uno utilizando Astro, consulta también este artículo:

- [Crear un sitio con Astro y publicarlo en GitHub Pages con GitHub Actions](./construindo-site-astro-github-pages/)

En él, muestro el proceso de creación de un proyecto Astro a partir de la plantilla de blog y la configuración de la publicación automática en GitHub Pages mediante GitHub Actions.

## Referencias

La documentación utilizada como referencia para este artículo es:

- [Astro — Add icons to external links](https://docs.astro.build/en/recipes/external-links/)
- [Astro — Markdown in Astro](https://docs.astro.build/en/guides/markdown-content/)

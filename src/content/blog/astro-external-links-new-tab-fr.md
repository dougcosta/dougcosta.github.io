---
titlet : "Ouvrir les liens externes des articles dans un nouvel onglet avec Astro"
description: "Comment créer et configurer un plugin avec Sätteri pour ouvrir automatiquement les liens externes des articles Markdown dans un nouvel onglet."
pubDatet : 2026-09-17
lang: fr
translationKey: astro-external-links
tags:
  - Astro
  - Markdown
  - Sätteri
  - JavaScript
draft: false
---

## Introduction

Lorsqu’on crée un site ou que l’on rédige des articles, il est très courant d’utiliser des liens externes vers des informations complémentaires, des références, des dépôts de code ou d’autres contenus.

Lorsque le lecteur consulte l’un de ces liens, on souhaite généralement qu’il puisse conserver le contenu principal ouvert. C’est pourquoi il est courant d’ouvrir ces liens dans un nouvel onglet ou une nouvelle fenêtre du navigateur.

J’ai été surpris de découvrir qu’Astro n’ouvre pas ces liens dans un nouvel onglet par défaut. Les liens continuent de s’ouvrir dans le même onglet, que l’on utilise Markdown ou directement la balise d’ancrage HTML (`<a href="...">`). 

Le problème est que Markdown ne possède pas de syntaxe propre permettant de définir des attributs HTML tels que `target="_blank"`. La syntaxe traditionnelle reste donc quelque chose comme :

```markdown
[Documentation d’Astro](https://docs.astro.build/)
```

Pour résoudre ce problème automatiquement, nous pouvons utiliser un plugin qui modifie les liens générés par Markdown avant leur transformation en HTML.

Dans cet article, nous allons créer ce plugin avec **Sätteri**, le processeur Markdown que nous utilisons dans le projet pour ce type d’extension.

## Ce que nous voulons faire

L’idée est simple. Chaque fois que le `href` d’un lien commence par `http://` ou `https://`, nous voulons que le HTML généré par Astro ressemble à ceci :

```html
<a href="https://docs.astro.build/" target="_blank" rel="noopener noreferrer">
  Documentation d’Astro
</a>
```

Nous ne voulons pas avoir à ajouter manuellement des attributs à chaque lien. Le plugin se chargera d’effectuer cette modification automatiquement.

Les liens internes du site, en revanche, ne doivent pas être modifiés.

## Installer Sätteri

Astro prend en charge le processeur Sätteri via le package `@astrojs/markdown-satteri`. Pour créer notre plugin, nous utiliserons également le package `satteri`.

Exécutez :

```bash
npm install @astrojs/markdown-satteri satteri
```

`@astrojs/markdown-satteri` permet d’utiliser Sätteri comme processeur Markdown dans Astro, tandis que le package `satteri` fournit les API nécessaires à la création de plugins personnalisés.

La documentation d’Astro présente également Sätteri comme une option permettant de créer des plugins qui modifient les éléments HTML générés à partir de Markdown.

## Créer le plugin

Créons maintenant un fichier pour notre plugin.

Dans mon projet, j’ai organisé les plugins dans `src/plugins`. Créez donc :

```text
src/plugins/external-links.ts
```

Le contenu du fichier sera :

```ts
import { defineHastPlugin } from 'satteri';

export const externalLinks = defineHastPlugin({
	namet : 'external-links',
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

Voyons maintenant ce qui se passe.

### Identifier les liens

Le plugin utilise `defineHastPlugin` pour définir un plugin HAST.

HAST est une représentation arborescente du HTML. Cela signifie qu’à cette étape du traitement, nous pouvons travailler directement avec les éléments HTML qui seront générés à partir de Markdown.

Dans notre cas, nous nous intéressons uniquement aux éléments `<a>` :

```ts
element: {
	filter: ['a'],
```

`visit` sera exécuté pour ces éléments.

### Vérifier si le lien est externe

Dans `visit`, nous récupérons d’abord l’adresse du lien :

```ts
const href = node.properties?.href;
```

Nous vérifions ensuite s’il commence par `http://` ou `https://` :

```ts
if (typeof href === 'string' && /^https?:\/\//.test(href)) {
```

Cette vérification est importante, car nous voulons modifier uniquement les liens externes.

Par exemple :

```text
https://docs.astro.build/
https://github.com/
http://example.com/
```

Les liens internes tels que :

```text
/blog/
```

ne remplissent pas cette condition et conservent le comportement normal du site.

### Ajouter target

Lorsqu’un lien externe est détecté, nous ajoutons :

```ts
ctx.setProperty(node, 'target', '_blank');
```

Le HTML résultant utilisera alors :

```html
target="_blank"
```

Le navigateur ouvrira ainsi l’adresse dans un nouvel onglet.

### Ajouter rel

Nous ajoutons également :

```ts
ctx.setProperty(node, 'rel', ['noopener', 'noreferrer']);
```

Le résultat sera équivalent à :

```html
rel="noopener noreferrer"
```

En plus d’être une configuration recommandée pour les liens utilisant `target="_blank"`, `noopener` empêche la page ouverte d’accéder à la fenêtre à l’origine de la navigation. De son côté, `noreferrer` empêche également l’envoi de l’information de référence (`Referer`) à la page de destination.

Les liens contenant des URL `http://` ou `https://` dans le contenu Markdown s’ouvrent ainsi par défaut dans un onglet séparé.

Si vous souhaitez ajouter d’autres attributs par défaut, il suffit de suivre la même logique et de les inclure ici.

## Configurer Astro

Nous devons maintenant indiquer à Astro que nous voulons utiliser notre plugin lors du traitement des fichiers Markdown.

Ouvrez le fichier suivant, situé à la racine du projet :

```text
astro.config.mjs
```

Commencez par importer `satteri` et le plugin que nous venons de créer :

```js
import { satteri } from '@astrojs/markdown-satteri';
import { externalLinks } from './src/plugins/external-links';
```

Configurez ensuite le processeur dans `markdown` :

```js
markdown: {
	processor: satteri({
		hastPlugins: [externalLinks],
	}),
},
```

Dans mon projet, la configuration est la suivante :

```js
// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { externalLinks } from './src/plugins/external-links';

export default defineConfig({
	sitet : 'https://dougcosta.com',
	integrations: [mdx(), sitemap()],
	markdown: {
		processor: satteri({
			hastPlugins: [externalLinks],
		}),
	},
});
```

## Tester le plugin

Nous pouvons maintenant tester le comportement.

Ajoutez un lien externe à un article Markdown :

```markdown
[Documentation d’Astro](https://docs.astro.build/)
```

Lancez ensuite le projet en local :

```bash
npm run dev
```

Ouvrez l’article dans votre navigateur et cliquez sur le lien. Il devrait s’ouvrir dans un nouvel onglet ou une nouvelle fenêtre, selon le navigateur et sa configuration.

Nous pouvons également vérifier le HTML généré par le navigateur. Faites un clic droit sur la page et choisissez l’option correspondant à `Inspecter` (le libellé peut varier selon le navigateur).

Le lien devrait contenir :

```html
target="_blank"
```

et :

```html
rel="noopener noreferrer"
```

## Un détail important : attention à `draft: true`

Au cours de ce processus, j’ai découvert un détail qui peut facilement conduire à une mauvaise conclusion pendant les tests.

Dans mon projet, les articles marqués comme :

```yaml
draft: true
```

ne sont pas inclus dans le build de production.

Cela signifie que si vous testez le plugin en exécutant la commande ci-dessous alors que l’article est marqué `draft: true`, son fichier HTML ne sera pas généré :

```bash
npm run build
```

Dans ce cas, rechercher `target="_blank"` dans le répertoire `dist` ne permettra pas de vérifier le fonctionnement du plugin, car l’article lui-même ne sera pas présent dans le build. Il n’y aura donc aucun fichier HTML correspondant à inspecter.

Par conséquent, **avant de tester le plugin dans un build de production, assurez-vous que l’article utilisé pour le test ne soit pas marqué `draft: true`**.

Pour qu’un article soit inclus dans le build, son frontmatter doit par exemple être configuré ainsi :

```yaml
---
titlet : "Mon article"
description: "Description de l’article."
pubDatet : 2026-09-16
draft: false
---
```

Ce détail peut sembler anodin, mais c’est précisément ce qui a initialement compliqué la validation du plugin dans mon projet.

## Pourquoi utiliser un plugin pour cela ?

Une autre possibilité serait de gérer `target="_blank"` individuellement dans chaque composant ou de modifier manuellement les liens après le rendu du Markdown.

Cela créerait toutefois une responsabilité supplémentaire pour chaque nouvel article.

Avec le plugin, la règle est centralisée :

```text
Article Markdown
     ↓
Sätteri
     ↓
Plugin external-links
     ↓
Identifie les liens externes
     ↓
Ajoute target="_blank"
     ↓
HTML final
```

À partir de là, tout nouveau lien externe ajouté à un article passe automatiquement par le même traitement.

Cela signifie également que nous n’avons pas besoin de penser à ajouter des attributs spécifiques chaque fois que nous créons un lien vers une documentation ou un autre site.

## Conclusion

À mon avis, il est surprenant que Markdown ne dispose pas de sa propre syntaxe pour contrôler des attributs HTML tels que `target`. Ce type de comportement est assez courant lors de la création d’un site, et il serait intéressant de pouvoir le configurer de manière plus directe.
La solution que j’ai trouvée consiste à utiliser un plugin, comme décrit dans cet article, mais il serait également possible de contrôler ce comportement individuellement dans chaque composant ou d’utiliser une autre approche.

La solution s’est finalement révélée assez simple : utiliser Sätteri pour intercepter les éléments `<a>` générés par Markdown et ajouter les attributs nécessaires aux liens. Malgré cela, il m’a fallu effectuer quelques recherches supplémentaires pour parvenir à cette approche.

L’important a été de comprendre que ce type de comportement peut être centralisé dans un plugin. Au lieu d’adapter chaque article individuellement, nous créons une règle qui s’applique à l’ensemble du contenu Markdown du site.

Un autre enseignement important concerne les tests. Lorsque nous travaillons avec des articles qui possèdent `draft: true`, nous devons nous rappeler qu’ils ne participent pas au build de production. Sinon, nous pouvons interpréter l’absence du contenu généré comme un problème du plugin, alors que l’article n’a tout simplement pas été inclus dans le build.

## Liens utiles

Si vous n’avez pas encore de site et souhaitez en créer un avec Astro, consultez également l’article :

- [Créer un site avec Astro et le publier sur GitHub Pages avec GitHub Actions](./construindo-site-astro-github-pages/)

J’y présente le processus de création d’un projet Astro à partir du template de blog ainsi que la configuration du déploiement automatique sur GitHub Pages avec GitHub Actions.

## Références

Les documentations utilisées comme références pour cet article sont :

- [Astro — Add icons to external links](https://docs.astro.build/en/recipes/external-links/)
- [Astro — Markdown in Astro](https://docs.astro.build/en/guides/markdown-content/)

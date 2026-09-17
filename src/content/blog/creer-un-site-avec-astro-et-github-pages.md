---
title: "Créer un site avec Astro et le publier sur GitHub Pages avec GitHub Actions"
description: "Un guide pratique pour créer un site avec le template de blog d’Astro et automatiser sa publication sur GitHub Pages."
lang: fr
translationKey: astro-github-pages
pubDate: 2026-09-16
tags:
  - Astro
  - GitHub Pages
  - GitHub Actions
  - JavaScript
draft: false
---

## Introduction

Je me souviens qu’au début de ma carrière, créer un site web n’était pas une activité complexe, mais c’était un travail particulièrement fastidieux. Construire tout le HTML et le CSS, puis vérifier le site sur différents navigateurs, demandait beaucoup de temps.
Pour les blogs, nous choisissions généralement une solution existante comme Blogger, qui fournissait déjà toute la structure nécessaire.
Aujourd’hui, des outils comme Astro et GitHub Pages rendent ce processus beaucoup plus simple. Nous pouvons créer notre propre site en quelques commandes et choisir un template dédié aux blogs, sans avoir à dépendre de solutions externes.

Dans cet article, je vais montrer, étape par étape, comment créer un site à partir du template de blog d’Astro, l’ajouter à un dépôt GitHub et configurer une publication automatique avec GitHub Actions. Il suffira d’effectuer un push sur la branche `main` pour que le site soit publié.

L’objectif est de partir d’un projet fraîchement créé et d’arriver à un site publié et accessible sur Internet, avec un processus de build et de déploiement entièrement automatisé.

---

## Créer le projet

### Prérequis

Avant de créer le projet, nous devons disposer de Node.js et de Git. Dans cet article, nous utiliserons NVM pour gérer les versions de Node.js.

Avant d’installer quoi que ce soit, nous pouvons vérifier si Node.js, NVM et Git sont déjà disponibles dans l’environnement.

Vérifions l’installation de Node.js :

```bash
node --version
```

Vérifions l’installation de NVM :

```bash
nvm --version
```

Nous aurons également besoin de Git et d’un compte GitHub pour les étapes de versionnement et de publication.

Pour vérifier que Git est disponible :

```bash
git --version
```

### Installer les prérequis

Si l’un des prérequis n’est pas installé, nous pouvons l’installer avant de poursuivre.

J’utilise un MacBook et Homebrew pour effectuer les installations. Les commandes présentées dans cet article supposent donc cet environnement, mais elles peuvent être adaptées à d’autres systèmes d’exploitation.

Commençons par installer NVM, qui nous permet de passer d’une version de Node à une autre sans créer de conflits entre différents projets. Par exemple :

```text
Projet A → Node 20
Projet B → Node 22
Projet C → Node 24
```

Pour installer NVM :

```bash
brew install nvm
```

J’utilise le shell Z (zsh) pour interpréter les commandes dans mon Terminal. Il faut donc le configurer afin qu’il puisse interpréter correctement les commandes NVM. Ces étapes ne sont pas nécessaires dans les environnements qui n’utilisent pas Z shell et peuvent être ignorées.

La première étape consiste à créer le répertoire de NVM :

```bash
mkdir -p ~/.nvm
```

Dans mon cas, avec un MacBook équipé d’Apple Silicon, Homebrew est installé dans `/opt/homebrew/opt/nvm/`. Avant d’exécuter la commande suivante, vérifiez le chemin utilisé sur votre machine et adaptez-le si nécessaire.

Ajoutons NVM au fichier `.zshrc` en exécutant la commande complète suivante :

```bash
cat <<'EOF' >> ~/.zshrc

# NVM
export NVM_DIR="$HOME/.nvm"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"
[ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && \. "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"
EOF
```

Rechargeons la configuration :

```bash
source ~/.zshrc
```

Vérifions que l’installation de NVM s’est bien déroulée et que la configuration de zsh est correcte :

```bash
nvm --version
```

La commande devrait retourner quelque chose comme ceci (version de NVM) :

```text
0.40.7
```

Si tout s’est déroulé comme prévu, nous pouvons maintenant installer Node.js.

Pour le projet Astro, nous utiliserons la version LTS de Node. LTS signifie Long-Term Support : il s’agit d’une version qui bénéficie d’un support et de mises à jour de sécurité pendant une période prolongée.

Exécutons :

```bash
nvm install --lts
```

Lors de l’exécution de cette commande, NVM va :

1. télécharger la version LTS de Node ;
2. l’installer dans `~/.nvm` ;
3. rendre `node` et `npm` disponibles ;
4. sélectionner généralement cette version pour la session en cours.

Vérifions ensuite avec :

```bash
node --version
npm --version
```

Les commandes devraient retourner quelque chose de similaire à :

```text
v24.x.x
11.x.x
```

Les numéros exacts peuvent varier selon la version LTS actuellement disponible.

Une fois l’installation confirmée, définissons la version LTS comme version par défaut :

```bash
nvm alias default "lts/*"
```

Lorsque vous ouvrirez un nouveau Terminal, NVM pourra sélectionner automatiquement cette version LTS.

Nous venons de mettre en place une petite chaîne d’outils qui sera utile pour tous les projets Node que vous réaliserez à l’avenir :

```text
macOS
  │
  ├── Homebrew
  │      └── installe les outils
  │
  └── NVM
         └── gère les versions de Node
                │
                ├── node
                └── npm
                       │
                       └── Astro
```

Nous sommes maintenant prêts à commencer la configuration du blog avec Astro.

### Créer le projet avec le template de blog

Une fois l’environnement prêt, nous pouvons créer un nouveau projet Astro avec la commande :

```bash
npm create astro@latest
```

Astro lance un assistant interactif pour configurer le nouveau projet.

Parmi les options disponibles, on trouve différents types de projets, notamment un projet de démarrage basique, un template de blog, un template de documentation basé sur Starlight et un projet minimal. À un moment donné, l’assistant nous demandera de choisir le type de projet et affichera quelque chose comme :

```text
How would you like to start your new project?
         ○ A basic, helpful starter project (recommended)
         ● Use blog template
         ○ Use docs (Starlight) template
         ○ Use minimal (empty) template
```

Nous choisirons **Use blog template**, car il fournit déjà une structure de départ adaptée à un site basé sur du contenu.

L’assistant demandera ensuite s’il doit installer les dépendances. Pour ce tutoriel, choisissez **Non** :

```text
Install dependencies? (recommended)
         ○ Yes  ● No
```

Il demandera ensuite s’il doit initialiser un nouveau dépôt Git. Choisissez également **Non**. Nous le ferons plus tard :

```text
Initialize a new git repository? (optional)
         ○ Yes  ● No
```

Une fois l’assistant terminé, entrons dans le répertoire choisi pour le projet. Dans mon cas, j’ai créé un répertoire appelé `blog`. Donc :

```bash
cd blog
```

Comme nous avons choisi de ne pas installer les dépendances avec l’assistant, nous devons les installer explicitement :

```bash
npm install
```

### Exécuter le projet en local

Astro fournit plusieurs commandes via `package.json`.

Nous pouvons afficher les scripts disponibles avec :

```bash
npm run
```

Parmi les principales commandes :

- `npm run dev` : démarre le serveur de développement.
- `npm run build` : génère le build de production.
- `npm run preview` : exécute localement le build de production.
- `npm run astro` : fournit la CLI d’Astro.

Les scripts disponibles peuvent varier selon le template et la configuration du projet.

Pour démarrer le serveur de développement :

```bash
npm run dev
```

Astro rend normalement le site disponible à l’adresse : [http://localhost:4321/](http://localhost:4321/).

En accédant à cette adresse dans le navigateur, nous pouvons voir le projet fonctionner en local.

À ce stade, le flux est simple :

```text
Code Astro
    ↓
npm run dev
    ↓
Serveur de développement Astro
    ↓
localhost:4321
    ↓
Navigateur
```

---

## Découvrir le projet initial

### Structure des répertoires

Après avoir créé le projet, il est utile de se familiariser avec sa structure avant de commencer à le modifier. Nous pouvons utiliser :

```bash
ls -la
```

La structure sera similaire à celle présentée ci-dessous et peut varier selon la version d’Astro et les options choisies dans l’assistant :

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

Parmi les répertoires les plus importants :

- `src/pages/` : contient les pages et les routes du site.
- `src/components/` : composants réutilisables.
- `src/layouts/` : layouts utilisés par les pages.
- `src/content/` : contenu organisé en collections.
- `src/assets/` : fichiers pouvant être traités par Astro, comme les images.
- `public/` : fichiers statiques qui seront servis directement.
- `astro.config.mjs` : configuration principale d’Astro.

L’un des avantages de commencer avec le template de blog est qu’une grande partie de la structure nécessaire à un site de contenu est déjà en place.

Le projet possède déjà des composants pour les éléments courants du site, des layouts pour les pages, une configuration pour le contenu Markdown/MDX et des fonctionnalités liées à la publication.

Il existe également de nombreux templates Astro gratuits et payants disponibles sur Internet, qui peuvent servir de point de départ. Il n’est pas nécessaire de limiter la personnalisation à ce template.

Le fichier `package.json` définit également quelques scripts de base :

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

## Préparer le projet pour GitHub

### Créer le dépôt

Lors de la création du projet Astro, nous avons choisi de ne pas initialiser de nouveau dépôt. Nous devons donc le faire manuellement. Exécutez :

```bash
git init
```

Pour utiliser GitHub Pages comme **site personnel**, le nom du dépôt suit une convention spécifique :

```text
<votre-utilisateur>.github.io
```

Dans mon cas, par exemple, le dépôt est :

```text
dougcosta.github.io
```

Créez sur GitHub un nouveau dépôt vide, sans ajouter de README, de `.gitignore` ou d’autres fichiers initiaux, puisque le projet existe déjà en local. Connectez ensuite le répertoire local au dépôt (veillez à utiliser les paramètres correspondant à votre propre répertoire) :

```bash
git branch -M main
git remote add origin https://github.com/<votre-utilisateur>/<votre-utilisateur>.github.io.git
```

Comme nous utilisons npm, le fichier `package-lock.json` doit également être versionné. Il enregistre les versions des dépendances utilisées par le projet et permet de reproduire l’installation de manière plus cohérente. Il est utilisé par l’action Astro pendant le processus de build. Vérifiez donc qu’il n’est pas inclus dans `.gitignore`.

### Configurer l’adresse du site dans Astro

Astro doit connaître l’URL publique du site.

Cette configuration se fait dans le fichier **`astro.config.mjs`**, situé à la racine du projet.

La propriété `site` doit recevoir l’URL publique. Dans mon cas, ce sera [https://dougcosta.github.io](https://dougcosta.github.io) ; remplacez-la par celle que vous avez définie :

```js
export default defineConfig({
  site: 'https://dougcosta.github.io',
});
```

La propriété `site` est utilisée par Astro pour générer des URL absolues lorsque cela est nécessaire.

Comme le dépôt suit la convention d’un site personnel GitHub Pages, le site sera publié directement à la racine du domaine :

```text
https://dougcosta.github.io/
```

---

## Publier sur GitHub Pages

### Configurer GitHub Actions

À ce stade, nous pouvons exécuter le projet en local et préparer le dépôt pour le versionnement et la publication automatique.

GitHub Pages peut héberger le résultat statique généré par Astro, tandis que GitHub Actions peut exécuter automatiquement le processus de build et de déploiement.

Pour cela, nous devons créer manuellement le fichier **`.github/workflows/deploy.yml`** et y ajouter le contenu suivant, qui configure un workflow de base pour ce projet :

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

Le workflow s’exécute automatiquement chaque fois qu’un `push` est effectué sur la branche `main`.

L’option `workflow_dispatch` permet également de lancer manuellement le workflow depuis l’interface GitHub.

L’action Astro installe les dépendances, exécute le build et téléverse l’artefact.

Tout d’abord, le job `build` :

```text
Récupération du code
       ↓
Installation des dépendances
       ↓
Build Astro
       ↓
Téléversement de l’artefact
```

Ensuite, le job `deploy` utilise l’artefact généré pour le publier sur GitHub Pages.

### Configurer GitHub Pages

Sur GitHub, accédez au dépôt du projet puis à :

```text
Settings → Pages
```

Dans `Build and deployment`, sélectionnez `GitHub Actions` comme source de publication.

### Effectuer le premier push

Avant d’envoyer les modifications vers `main`, il est recommandé de valider localement le build de production.

```bash
npm run build
```

Si le build se termine sans erreur, nous pouvons envoyer le code vers GitHub.

Après le push sur la branche `main`, GitHub Actions détectera la modification et démarrera automatiquement le workflow.

Ajoutons les fichiers au contrôle de version :

```bash
git add .
```

Créons le premier commit :

```bash
git commit -m "Initial commit"
```

Envoyons les modifications vers le dépôt distant :

```bash
git push -u origin main
```

### Le processus de build et de déploiement

À partir de ce moment, le processus de publication ne dépend plus d’une exécution manuelle.

À chaque nouveau `push` sur la branche `main` :

```text
git push
    ↓
GitHub
    ↓
GitHub Actions
    ↓
Build Astro
    ↓
Artefact du site
    ↓
GitHub Pages
    ↓
Site mis à jour
```

Cela signifie qu’après la configuration initiale, publier une modification du site devient presque une conséquence naturelle du workflow de développement.

À la fin de ce processus, nous disposons d’un site Astro publié sur GitHub Pages avec un processus automatisé de build et de déploiement.

Le code reste versionné sur GitHub et chaque modification envoyée sur la branche `main` génère une nouvelle version en production, publiée automatiquement.

---

## Conclusion

Créer et publier un site avec Astro et GitHub Pages est un processus très simple. Une grande partie des étapes décrites ici concerne la préparation de l’environnement et l’installation des prérequis. Quelques commandes seulement sont nécessaires pour faire fonctionner Astro en local.

À partir d’un template prêt à l’emploi, nous avons versionné le code et configuré un processus de build et de déploiement avec GitHub Actions, pour obtenir un site statique avec une publication automatisée et sans avoir à maintenir notre propre serveur.

Pour quelqu’un qui a commencé à travailler dans le développement logiciel il y a deux décennies, la différence est particulièrement intéressante. Au début de ma carrière, mettre un site en ligne impliquait beaucoup plus d’étapes de configuration, d’infrastructure et de publication. Aujourd’hui, il est possible de passer d’un répertoire vide à un site publié et automatisé en relativement peu d’étapes. Je trouve que cette simplicité est l’un des aspects les plus intéressants du développement web moderne.

## Références

Les documentations officielles utilisées comme références pour cet article sont :

- [Astro — Installation et configuration](https://docs.astro.build/pt-br/install-and-setup/)
- [Astro — Publier sur GitHub Pages](https://v6.docs.astro.build/en/guides/deploy/github/)
- [Node.js — Téléchargement et installation](https://nodejs.org/pt-br/download)
- [GitHub Docs — Créer un dépôt](https://docs.github.com/en/repositories/creating-and-managing-repositories/quickstart-for-repositories)
- [GitHub Docs — Créer un site avec GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [GitHub Docs — Guide de démarrage de GitHub Pages](https://docs.github.com/en/pages/quickstart)

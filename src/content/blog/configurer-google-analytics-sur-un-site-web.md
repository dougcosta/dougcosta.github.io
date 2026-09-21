---
title: "Configurer Google Analytics sur un site web"
description: "Un guide pratique pour configurer Google Analytics 4 et suivre le trafic d'un site web."
lang: fr
translationKey: google-analytics-site-configuration
pubDate: 2026-09-21
tags:
  - Google Analytics
  - Web
  - JavaScript
  - Astro
draft: false
---

## Introduction

L'objectif principal, lorsque nous mettons un site web ou une application en ligne, est d'attirer des visiteurs et de créer une audience engagée. Les données nous permettent de vérifier si cet objectif est atteint ; nous avons donc besoin d'un moyen de les collecter.

Des indicateurs tels que le nombre de visiteurs, les pages ou les écrans les plus consultés, l'origine des visiteurs et leur navigation dans le contenu nous aident à comprendre l'intérêt du public et à faire évoluer le produit.

Pour suivre ces informations, nous pouvons utiliser **Google Analytics 4 (GA4)**.

Dans cet article, nous allons configurer Google Analytics sur un site web, de la création du compte jusqu'à la validation de la collecte des données.

L'exemple présenté dans cet article utilise un site construit avec Astro et publié sur GitHub Pages. Cependant, la configuration de Google Analytics présentée ici peut être utilisée avec différentes technologies et plateformes. Ce qui change principalement, c'est la manière d'ajouter la tag au code du site.

## Créer et configurer un compte Google Analytics

### Créer le compte

La première étape consiste à accéder à Google Analytics : [Google Analytics](https://analytics.google.com/).

Connectons-nous avec le compte Google qui sera utilisé pour administrer Analytics. Si aucun compte Google Analytics n'existe encore, nous devons en créer un.

### Créer une propriété

L'étape suivante consiste à créer une propriété. Une propriété représente l'ensemble de données que nous souhaitons analyser dans Google Analytics. C'est à cet endroit que les données collectées par Google Analytics sont organisées. Dans notre exemple, c'est là que nous accéderons aux données de notre site.

Nous pouvons donner à la propriété le nom du site. Par exemple :

```text
Mon Nouveau Site Web
```

### Catégoriser la propriété

Lors de cette étape, Google Analytics demande certaines informations qui peuvent sembler davantage destinées aux entreprises, comme le secteur d'activité et la taille de l'entreprise.

Cette étape peut soulever des questions lorsque nous configurons Analytics pour un site personnel.

Même si nous n'avons pas d'entreprise, ces questions font partie du processus de configuration de Google Analytics.

Dans mon cas, puisqu'il s'agit d'un site personnel consacré à la technologie, j'ai choisi la catégorie de secteur la plus proche de **Technologie/Logiciels**.

Pour la taille de l'entreprise, j'ai sélectionné **Petite**, car c'était l'option la plus proche de la réalité d'un site personnel.

Il n'est pas nécessaire d'avoir une entreprise officiellement constituée, un CNPJ ou une structure d'entreprise pour utiliser Google Analytics sur un site personnel.

### Configurer le fuseau horaire et la devise

Lors de la configuration de la propriété, nous devons également définir le fuseau horaire et la devise.

Choisissons le fuseau horaire correspondant à la région qui servira de référence pour nos rapports.

Par exemple :

```text
Fuseau horaire : (GMT-03:00) São Paulo
Devise : BRL — Réal brésilien
```

Le fuseau horaire est important, car il influence la manière dont les données sont regroupées par jour dans les rapports.

## Créer un flux de données

Après avoir créé la propriété, nous devons indiquer à Google Analytics d'où proviendront les données.

Pour un site web, nous devons créer un flux de données de type **Web**.

Nous devons renseigner l'URL du site que nous souhaitons suivre. Dans l'exemple de cet article :

```text
https://meunnouveausite.com
```

Nous pouvons également définir un nom pour le flux :

```text
Nouveau Site Web
```

Lors de cette configuration, gardons la **Mesure améliorée** activée.

Elle permet à Google Analytics de collecter automatiquement certains événements et certaines informations sur la navigation, sans qu'il soit nécessaire d'implémenter chaque événement manuellement.

Après avoir créé le flux, Google Analytics affiche ses informations, notamment l'**ID de mesure**.

L'ID ressemble à ceci :

```text
G-XXXXXXXXXX
```

Cet identifiant sera utilisé par la tag installée sur le site.

## Installer la Google tag

Après avoir créé le flux de données Web, Google Analytics propose une option permettant d'installer la Google tag sur le site. Ne fermons pas cette page ou cet onglet, car nous y reviendrons plus tard pour valider l'installation.

La tag doit être ajoutée au code des pages que nous souhaitons suivre.

Google Analytics fournit un code similaire à celui-ci :

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
	window.dataLayer = window.dataLayer || [];
	function gtag(){dataLayer.push(arguments);}
	gtag('js', new Date());

	gtag('config', 'G-XXXXXXXXXX');
</script>
```

Remplaçons `G-XXXXXXXXXX` par l'ID de mesure généré pour notre flux de données Web. Il est préférable de copier ce code directement depuis Google Analytics plutôt que depuis cet article. Ainsi, nous n'avons pas à nous soucier de remplacer manuellement l'ID.

La manière d'ajouter ce code dépend de la technologie utilisée par le site.

Si le site utilise directement du HTML, par exemple, la tag peut être ajoutée dans le `<head>` de **toutes** les pages. Les pages qui ne contiennent pas cette tag n'enverront pas de données à Google Analytics.

Si le site utilise un framework ou un générateur de site, il existe généralement un layout, un template ou un composant partagé dans lequel nous pouvons ajouter le code une seule fois. C'est ce que j'ai fait dans mon cas. J'utilise Astro et j'ai donc ajouté la tag au layout partagé par les pages du site, afin qu'elle soit présente partout. Ainsi, les nouvelles pages incluront également le code automatiquement.

Il est important de s'assurer que ce code ne soit exécuté qu'en production. Sinon, les visites générées pendant le développement ou dans les environnements de staging peuvent également être comptabilisées par Google Analytics, ce qui peut fausser les métriques.

Dans mon cas, j'ai ajouté une condition qui vérifie si l'environnement actuel est la production (**`import.meta.env.PROD`**) avant de générer le code GA :

```astro
<!-- Google tag (gtag.js) -->
{import.meta.env.PROD && (			
	<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}
		gtag('js', new Date());

		gtag('config', 'G-XXXXXXXXXX');
	</script>
)}
```

## Tester l'installation

Après avoir publié le site avec la tag, nous pouvons utiliser les outils de vérification fournis par Google Analytics.

Lors de la configuration du flux, un bouton **Tester l'installation** est disponible.

Utilisons cette option une fois la nouvelle version du site publiée.

Dans l'exemple de cet article, Google a affiché le message suivant :

> La Google tag a été détectée sur votre site.

Cela confirme que Google a réussi à trouver la tag sur la page.

Le bouton **Tester l'installation** devient alors **Confirmer**. Lorsque nous cliquons dessus, Google affiche notamment les informations suivantes :

- nom du flux ;
- URL du flux ;
- ID de mesure.

Un message peut également indiquer que la collecte des données n'est pas encore active. Par exemple :

> La collecte des données n'est pas active sur votre site. Si vous avez installé les tags il y a plus de 48 heures, vérifiez qu'elles sont correctement configurées.

Ce message ne signifie pas nécessairement que l'installation est incorrecte. Des données doivent parvenir à Google Analytics pour que la collecte puisse être confirmée. Pour effectuer une vérification immédiate, nous pouvons utiliser le rapport **Temps réel**.

## Vérifier la collecte des données

Pour effectuer une vérification plus complète, nous pouvons utiliser le rapport **Temps réel** de Google Analytics.

Après avoir publié le site :

1. Ouvrons Google Analytics.
2. Accédons à **Rapports → Temps réel**.
3. Ouvrons le site dans un autre onglet ou une autre fenêtre du navigateur.
4. Naviguons sur quelques pages.
5. Attendons quelques instants.
6. Vérifions si l'activité apparaît dans le rapport.

Dans l'exemple de cet article, l'activité est apparue correctement dans le rapport, ce qui a confirmé que la collecte des données fonctionnait.

Le rapport en temps réel est particulièrement utile lors de la configuration initiale, car il permet de vérifier l'activité récente sans attendre la consolidation des rapports historiques.

## Changer de domaine à l'avenir

Il est courant qu'un site commence avec une adresse fournie par une plateforme d'hébergement, puis passe ensuite à un domaine personnalisé.

Par exemple, le site utilisé dans cet article peut initialement être disponible à l'adresse suivante :

```text
https://meunnouveausite.com
```

puis passer à :

```text
https://monsiteweb.com
```

Changer de domaine ne signifie pas nécessairement que nous devons créer une nouvelle propriété Google Analytics. Nous pouvons continuer à utiliser la propriété existante et conserver l'historique des données déjà collectées.

Une fois le nouveau domaine configuré, nous pouvons mettre à jour l'URL du flux de données Web existant et continuer à utiliser le même ID de mesure.

Le code installé sur le site peut également continuer à utiliser le même ID (`G-XXXXXXXXXX`).

Nous pouvons ainsi conserver la même propriété et le même flux de données Web tout en préservant l'historique des données déjà collectées.

## Conclusion

Configurer Google Analytics sur un site web est un processus assez simple.

Nous commençons par créer le compte et la propriété, puis nous configurons le flux de données Web et obtenons l'ID de mesure. Ensuite, nous ajoutons la tag au site, en veillant à ce qu'elle ne soit exécutée qu'en production, puis nous publions le site afin que le code soit disponible pour les visiteurs.

Enfin, nous utilisons les outils de vérification de Google ainsi que le rapport en temps réel pour confirmer que les données sont bien collectées.

À partir de ce moment, nous commençons à avoir une vision plus claire de la manière dont le site est utilisé. À mesure que nous publions de nouveaux contenus et que le trafic augmente, ces données peuvent nous aider à comprendre quelles pages reçoivent le plus de visites et d'où viennent les visiteurs.

## Liens utiles

Si vous n'avez pas encore de site et souhaitez en créer un avec Astro, vous pouvez également consulter l'article :

- [Créer un site avec Astro et le publier sur GitHub Pages avec GitHub Actions](../creer-un-site-avec-astro-et-github-pages/)

Si vous utilisez Astro et que, comme moi, vous souhaitez que les liens externes de votre site s'ouvrent dans un nouvel onglet, découvrez comment j'ai mis en place cette fonctionnalité dans l'article :

- [Ouvrir les liens externes des articles dans un nouvel onglet avec Astro](../astro-liens-dans-un-nouvel-onglet/)

## Références

Les documentations utilisées comme références pour cet article sont les suivantes :

- [Google Analytics — Configurer Google Analytics](https://support.google.com/analytics/answer/14183469?hl=fr)
- [Google Analytics — Installer la Google tag](https://support.google.com/analytics/answer/9744165?hl=fr)
- [Google Analytics — Vérifier la collecte des données en temps réel](https://support.google.com/analytics/answer/9271392?hl=fr)

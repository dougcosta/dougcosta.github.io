---
title: "Building a Website with Astro and Publishing It on GitHub Pages with GitHub Actions"
description: "A practical guide to creating a website with Astro's blog template and automating its publication on GitHub Pages."
lang: en
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

I remember that, early in my career, creating a website was not a complex activity, but it was very labor-intensive. Building all the HTML and CSS, as well as validating the site across different browsers, took a considerable amount of time.
When it came to blogs, we would usually choose an existing platform such as Blogger, which already provided all the necessary structure.
Today, tools such as Astro and GitHub Pages make this process much simpler. We can create our own website with just a few commands and choose a dedicated blog template, without having to rely on external solutions.

In this article, I will show, step by step, how to create a website using Astro's blog template, add it to a GitHub repository, and configure an automated publishing workflow with GitHub Actions. All it takes is a push to the `main` branch, and our site will be published.

The goal is to start with a newly created project and end up with a website published and accessible on the internet, with the build and deploy process fully automated.

---

## Creating the project

### Prerequisites

Before creating the project, we need to have Node.js and Git installed. In this article, we will use NVM to manage Node.js versions.

Before installing anything, we can check whether Node.js, NVM, and Git are already available in the environment.

We can check the Node.js installation with:

```bash
node --version
```

We can check the NVM installation with:

```bash
nvm --version
```

We will also need Git installed and a GitHub account for the version control and publishing steps.

To check whether Git is available:

```bash
git --version
```

### Installing the prerequisites

If any of the prerequisites are not installed, we can install them before continuing.

I am using a MacBook and Homebrew for the installations. Therefore, the commands shown in this article assume that environment, but they can be adapted to other operating systems.

First, let's install NVM, which allows us to switch between Node versions without creating conflicts between different projects. For example:

```text
Project A → Node 20
Project B → Node 22
Project C → Node 24
```

To install NVM:

```bash
brew install nvm
```

I use the Z shell (zsh) to interpret commands in my Terminal. Therefore, it needs to be configured so that it can properly interpret NVM commands. These steps are not required in environments that do not use Z shell and can be skipped.

The first step is to create the NVM directory:

```bash
mkdir -p ~/.nvm
```

In my case, using a MacBook with Apple Silicon, Homebrew is installed under `/opt/homebrew/opt/nvm/`. Before running the next command, check the path on your machine and adjust it accordingly.

We add NVM to the `.zshrc` file by running this entire command:

```bash
cat <<'EOF' >> ~/.zshrc

# NVM
export NVM_DIR="$HOME/.nvm"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"
[ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && \. "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"
EOF
```

Reload the configuration:

```bash
source ~/.zshrc
```

Let's verify that NVM was installed successfully and that the zsh configuration is correct:

```bash
nvm --version
```

It should return something like the following (NVM version):

```text
0.40.7
```

If everything went as expected, we can now install Node.js.

For the Astro project, we will use the LTS version of Node. LTS stands for Long-Term Support and refers to a version that receives support and security updates for an extended period.

Run:

```bash
nvm install --lts
```

When you run the command, NVM will:

1. download the LTS version of Node;
2. install it under `~/.nvm`;
3. make `node` and `npm` available;
4. normally select this version for the current session.

Then verify the installation with:

```bash
node --version
npm --version
```

The commands should return something similar to:

```text
v24.x.x
11.x.x
```

The exact numbers may differ depending on the current LTS version.

With the installation confirmed, let's make the LTS version the default:

```bash
nvm alias default "lts/*"
```

When you open a new Terminal, NVM can automatically select this LTS version.

We have just put together a small toolchain that will be useful for any Node project you work on from now on:

```text
macOS
  │
  ├── Homebrew
  │      └── installs tools
  │
  └── NVM
         └── manages Node versions
                │
                ├── node
                └── npm
                       │
                       └── Astro
```

Now we are ready to start setting up the blog with Astro.

### Creating the project with the blog template

With the environment ready, we can create a new Astro project using:

```bash
npm create astro@latest
```

Astro starts an interactive wizard to configure the new project.

Among the available options are different project types, including a basic starter project, a blog template, a documentation template based on Starlight, and a minimal project. At some point, the wizard will ask us to choose the project type, displaying something like:

```text
How would you like to start your new project?
         ○ A basic, helpful starter project (recommended)
         ● Use blog template
         ○ Use docs (Starlight) template
         ○ Use minimal (empty) template
```

We will choose **Use blog template**, because it already provides a suitable starting structure for a content-based website.

Next, the wizard will ask whether it should install the dependencies. For this walkthrough, choose **No**:

```text
Install dependencies? (recommended)
         ○ Yes  ● No
```

The wizard will then ask whether it should initialize a new Git repository. Again, choose **No**. We will do that later:

```text
Initialize a new git repository? (optional)
         ○ Yes  ● No
```

Once the wizard finishes, enter the directory we selected for the project. In my case, I created a directory called `blog`. So:

```bash
cd blog
```

Since we chose not to install the dependencies through the wizard, we need to install them explicitly:

```bash
npm install
```

### Running the project locally

Astro provides several commands through `package.json`.

We can view the available scripts with:

```bash
npm run
```

Some of the main commands are:

- `npm run dev`: starts the development server.
- `npm run build`: generates the production build.
- `npm run preview`: runs the production build locally.
- `npm run astro`: provides the Astro CLI.

The available scripts may vary depending on the template and project configuration.

To start the development server:

```bash
npm run dev
```

Astro will make the site available at: [http://localhost:4321/](http://localhost:4321/).

Open this address in your browser to see the project running locally.

At this point, the flow is straightforward:

```text
Astro code
    ↓
npm run dev
    ↓
Astro development server
    ↓
localhost:4321
    ↓
Browser
```

---

## Understanding the initial project

### Directory structure

After creating the project, it is worth getting familiar with its structure before starting to modify it. We can use:

```bash
ls -la
```

The structure will look similar to the following and may vary depending on the Astro version and the options selected in the wizard:

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

Some of the most important directories are:

- `src/pages/`: contains the site's pages and routes.
- `src/components/`: reusable components.
- `src/layouts/`: layouts used by the pages.
- `src/content/`: content organized into collections.
- `src/assets/`: files that can be processed by Astro, such as images.
- `public/`: static files that will be served directly.
- `astro.config.mjs`: the main Astro configuration file.

One of the advantages of starting with the blog template is that much of the structure needed for a content website is already in place.

The project already includes components for common site elements, layouts for pages, Markdown/MDX content configuration, and features related to publishing.

It is also worth noting that there are many free and paid Astro templates available online that can be used as a starting point. You are not limited to customizing this particular layout.

The `package.json` file also defines some basic scripts:

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

## Preparing the project for GitHub

### Creating the repository

When creating the Astro project, we chose not to initialize a new repository. We therefore need to do this manually. Run:

```bash
git init
```

To use GitHub Pages as a **personal website**, the repository follows a specific naming convention:

```text
<your-username>.github.io
```

In my case, for example, the repository is:

```text
dougcosta.github.io
```

Create a new empty repository on GitHub, without adding a README, `.gitignore`, or other initial files, since the project already exists locally. Then connect the local directory to it (make sure to use the settings specific to your directory):

```bash
git branch -M main
git remote add origin https://github.com/<your-username>/<your-username>.github.io.git
```

Since we are using npm, `package-lock.json` should also be committed. It records the dependency versions used by the project and allows the installation to be reproduced more consistently. It is used by the Astro action during the build process. Therefore, make sure it is not included in `.gitignore`.

### Configuring the site URL in Astro

Astro needs to know the public URL of the site.

This configuration is made in the **`astro.config.mjs`** file at the root of the project.

The `site` property should contain the public URL. In my case, it will be [https://dougcosta.github.io](https://dougcosta.github.io); replace it with the URL you defined:

```js
export default defineConfig({
  site: 'https://dougcosta.github.io',
});
```

The `site` property is used by Astro to generate absolute URLs when necessary.

Because the repository follows the convention for a personal GitHub Pages site, the site will be published directly at the root of the domain:

```text
https://dougcosta.github.io/
```

---

## Publishing on GitHub Pages

### Configuring GitHub Actions

At this point, we can run the project locally and prepare the repository for version control and automated publishing.

GitHub Pages can host the static output generated by Astro, while GitHub Actions can automatically run the build and deployment process.

To do this, we need to manually create the **`.github/workflows/deploy.yml`** file and add the following content, which configures a basic workflow for this project:

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

The workflow runs automatically whenever a `push` occurs on the `main` branch.

There is also a `workflow_dispatch` option, which allows the workflow to be started manually from the GitHub interface.

The Astro action installs the dependencies, runs the build, and uploads the artifact.

First, the `build` job:

```text
Checkout the code
       ↓
Install dependencies
       ↓
Build Astro
       ↓
Upload artifact
```

Then, the `deploy` job uses the generated artifact to publish it to GitHub Pages.

### Configuring GitHub Pages

On GitHub, open the project repository and go to:

```text
Settings → Pages
```

Under `Build and deployment`, select `GitHub Actions` as the publishing source.

### Making the first push

Before sending changes to `main`, it is good practice to validate the production build locally.

```bash
npm run build
```

If the build completes without errors, we can push the code to GitHub.

After pushing to the `main` branch, GitHub Actions will detect the change and automatically start the workflow.

Add the files to version control:

```bash
git add .
```

Create the first commit:

```bash
git commit -m "Initial commit"
```

Push the changes to the remote repository:

```bash
git push -u origin main
```

### The build and deploy process

From this point on, publishing no longer depends on a manual process.

Whenever there is a new `push` to the `main` branch:

```text
git push
    ↓
GitHub
    ↓
GitHub Actions
    ↓
Astro build
    ↓
Site artifact
    ↓
GitHub Pages
    ↓
Updated site
```

This means that, after the initial setup, publishing a change to the site becomes a natural consequence of the development workflow.

At the end of this process, we have an Astro website published on GitHub Pages with an automated build and deployment process.

The code remains versioned on GitHub, and every change pushed to the `main` branch generates a new production version that is published automatically.

---

## Conclusion

Creating and publishing a website with Astro and GitHub Pages is a very straightforward process. Much of the work described here is related to preparing the environment and installing the prerequisites. Only a few commands are needed to get Astro running locally.

Starting from a ready-made template, we versioned the code and configured a build and deployment workflow using GitHub Actions, resulting in a static website with an automated publishing process and no need to maintain our own server.

For someone who started working in software development two decades ago, the difference is particularly interesting. Early in my career, putting a website online involved many more configuration, infrastructure, and publishing steps. Today, it is possible to go from an empty directory to a published and automated website in relatively few steps. I think that simplicity is one of the most interesting aspects of modern web development.

## References

The official documentation used as references for this article is:

- [Astro — Installation and setup](https://docs.astro.build/pt-br/install-and-setup/)
- [Astro — Deploying to GitHub Pages](https://v6.docs.astro.build/en/guides/deploy/github/)
- [Node.js — Download and installation](https://nodejs.org/pt-br/download)
- [GitHub Docs — Creating a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/quickstart-for-repositories)
- [GitHub Docs — Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [GitHub Docs — GitHub Pages quickstart](https://docs.github.com/en/pages/quickstart)

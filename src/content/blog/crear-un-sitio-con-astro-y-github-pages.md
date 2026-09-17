---
title: "Cómo crear un sitio con Astro y publicarlo en GitHub Pages con GitHub Actions"
description: "Una guía práctica para crear un sitio con la plantilla de blog de Astro y automatizar su publicación en GitHub Pages."
lang: es
translationKey: astro-github-pages
pubDate: 2026-09-16
tags:
  - Astro
  - GitHub Pages
  - GitHub Actions
  - JavaScript
draft: false
---

## Introducción

Recuerdo que al comienzo de mi carrera crear un sitio web no era una actividad compleja, pero sí requería mucho trabajo. Construir todo el HTML y CSS, además de validar el sitio en diferentes navegadores, demandaba bastante tiempo.

Cuando hablábamos de blogs, la mayoría de las veces elegíamos alguna herramienta del mercado, como Blogger, que ya proporcionaba toda la estructura necesaria.

Hoy, herramientas como Astro y GitHub Pages hacen que este proceso sea mucho más sencillo. Podemos crear nuestro propio sitio con pocos comandos, además de poder elegir una plantilla específica para blogs, sin depender de soluciones externas.

En este artículo, voy a mostrar, paso a paso, cómo crear un sitio utilizando la plantilla de blog de Astro, colocarlo en un repositorio de GitHub y configurar una rutina de publicación automática utilizando GitHub Actions. Bastará con hacer un push en la rama main y nuestro sitio estará publicado.

El objetivo es partir de un proyecto recién creado y llegar a un sitio publicado y accesible por Internet, con el proceso de build y deploy automatizado.

---

## Creando el proyecto

### Requisitos previos

Antes de crear el proyecto, necesitamos tener Node.js y Git instalados. En este artículo, utilizaremos NVM para gestionar las versiones de Node.js.

Antes de instalar cualquier cosa, podemos comprobar si Node.js, NVM y Git ya están disponibles en el entorno.

Comprobamos la instalación de Node.js:
```bash
node --version
```

Comprobamos la instalación de NVM.
```bash
nvm --version
```

También será necesario tener Git instalado y una cuenta de GitHub para las etapas de versionado y publicación.

Para comprobar si Git está disponible en el entorno:
```bash
git --version
```

### Instalando los requisitos previos

Si alguno de los requisitos previos no está instalado, podemos hacerlo antes de continuar.

Estoy utilizando un MacBook y utilizaré Homebrew para realizar las instalaciones. Por lo tanto, los comandos presentados en este artículo consideran este entorno, pero pueden adaptarse a otros sistemas operativos.

Primero, vamos a instalar NVM, que nos permitirá alternar entre versiones de Node sin generar conflictos entre diferentes proyectos. Por ejemplo:
```text
Proyecto A → Node 20
Proyecto B → Node 22
Proyecto C → Node 24
```

Para instalar NVM:
```bash
brew install nvm
```

Utilizo Z shell (zsh) para interpretar los comandos en mi Terminal. Por lo tanto, es necesario realizar la configuración para que interprete correctamente los comandos de NVM. Estos pasos no son necesarios en entornos que no utilizan Z shell y pueden omitirse.

El primer paso es crear el directorio de NVM:
```bash
mkdir -p ~/.nvm
```

En mi caso, utilizando un MacBook con Apple Silicon, la ruta de Homebrew es `/opt/homebrew/opt/nvm/`. Antes de ejecutar el siguiente comando, es necesario comprobar la ruta en tu máquina y modificarla adecuadamente.

Añadimos NVM al archivo `.zshrc` ejecutando este comando completo:
```bash
cat <<'EOF' >> ~/.zshrc

# NVM
export NVM_DIR="$HOME/.nvm"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"
[ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && \. "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"
EOF
```

Recargamos la configuración:
```bash
source ~/.zshrc
```

Validamos que la instalación de NVM se haya realizado correctamente y que la configuración de zsh sea correcta:
```bash
nvm --version
```

Debe devolver algo como (versión de NVM):
```text
0.40.7
```

Si todo ha ocurrido como esperábamos, podemos comenzar ahora la instalación de Node.js.

Para el proyecto de Astro, utilizaremos la versión LTS de Node. LTS es la sigla de Long-Term Support (Soporte a Largo Plazo), que indica una versión que recibe soporte y actualizaciones de seguridad durante un período prolongado.

Ejecutamos:
```bash
nvm install --lts
```

Al ejecutar el comando, NVM:
1. descarga la versión LTS de Node;
2. la instala dentro de tu ~/.nvm;
3. pone a disposición node y npm;
4. normalmente selecciona esta versión para la sesión actual.

Después, comprobamos ejecutando los dos comandos:
```bash
node --version
npm --version
```

Los comandos deberían devolver algo similar a:
```text
v24.x.x
11.x.x
```

Los números exactos pueden ser diferentes según la versión LTS vigente.

Con las instalaciones confirmadas, vamos a establecer la versión LTS como predeterminada:
```bash
nvm alias default "lts/*"
```

Al abrir una nueva Terminal, NVM podrá seleccionar automáticamente esta versión LTS.

Acabamos de montar una pequeña cadena de herramientas que será útil para cualquier proyecto Node que desarrolles de ahora en adelante:
```text
macOS
  │
  ├── Homebrew
  │      └── instala herramientas
  │
  └── NVM
         └── gestiona versiones de Node
                │
                ├── node
                └── npm
                       │
                       └── Astro
```

Ahora estamos preparados para comenzar la configuración del blog mediante Astro.

### Creando el proyecto con la plantilla de blog

Con el entorno preparado, podemos crear un nuevo proyecto Astro utilizando el comando:
```bash
npm create astro@latest
```

Astro inicia un asistente interactivo para configurar el nuevo proyecto.

Entre las opciones disponibles hay diferentes tipos de proyecto, incluyendo un proyecto inicial básico, una plantilla de blog, una plantilla de documentación basada en Starlight y un proyecto mínimo. En algún momento, nos solicitará que elijamos el tipo de proyecto, mostrando algo como:
```text
How would you like to start your new project?
        ○ A basic, helpful starter project (recommended)
        ● Use blog template 
        ○ Use docs (Starlight) template 
        ○ Use minimal (empty) template
```

Nuestra elección será **Use blog template**, ya que proporciona una estructura inicial adecuada para un sitio basado en contenido.

A continuación, el asistente preguntará si debe instalar las dependencias. Para el paso a paso de este artículo, elegiremos **no**:
```text
Install dependencies? (recommended)
         ○ Yes  ● No
```

A continuación, el asistente preguntará si debe inicializar un nuevo repositorio Git. También elegiremos **no**. Lo haremos más adelante:
```text
Initialize a new git repository? (optional)
         ○ Yes  ● No
```

Al finalizar el asistente, entramos en el directorio que elegimos para el proyecto. En mi caso, creé un directorio llamado `blog`. Entonces:
```bash
cd blog
```

Como optamos por no instalar las dependencias mediante el asistente, debemos instalarlas ejecutando explícitamente el comando:
```bash
npm install
```

### Ejecutando el proyecto localmente

Astro proporciona algunos comandos mediante el `package.json`.

Podemos visualizar los scripts disponibles con:
```bash
npm run
```

Entre los principales comandos están:
- `npm run dev`: inicia el servidor de desarrollo.
- `npm run build`: genera el build de producción.
- `npm run preview`: ejecuta localmente el build de producción.
- `npm run astro`: proporciona la CLI de Astro.

Cabe destacar que los scripts disponibles pueden variar según la plantilla y las configuraciones del proyecto.

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

Astro normalmente pondrá el sitio a disposición en: [http://localhost:4321/](http://localhost:4321/).

Al acceder a esta dirección en el navegador, podemos visualizar el proyecto funcionando localmente.

El flujo en este momento es sencillo:

```text
Código Astro
     ↓
npm run dev
     ↓
Servidor de desarrollo de Astro
     ↓
localhost:4321
     ↓
Navegador
```

---

## Conociendo el proyecto inicial

### Estructura de directorios

Después de crear el proyecto, vale la pena conocer su estructura antes de comenzar a modificarlo. Utilizamos la siguiente instrucción:
```bash
ls -la
```

La estructura será similar a la que se muestra a continuación y puede variar según la versión de Astro y las opciones elegidas en el asistente:
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

Algunas de las carpetas más importantes son:

- `src/pages/`: contiene las páginas y rutas del sitio.
- `src/components/`: componentes reutilizables.
- `src/layouts/`: layouts utilizados por las páginas.
- `src/content/`: contenido organizado en colecciones.
- `src/assets/`: archivos que pueden ser procesados por Astro, como imágenes.
- `public/`: archivos estáticos que se pondrán a disposición directamente.
- `astro.config.mjs`: configuración principal de Astro.

Una de las ventajas de comenzar con la plantilla de blog es que gran parte de la estructura necesaria para un sitio de contenido ya está preparada.

El proyecto ya cuenta con componentes para elementos comunes del sitio, layouts para las páginas, configuración para contenido en Markdown/MDX y recursos relacionados con la publicación.

También vale la pena destacar que existen diversas plantillas de Astro, gratuitas y de pago, que pueden encontrarse en Internet y utilizarse como punto de partida. No es necesario limitar la personalización del layout a esta plantilla.

El archivo `package.json` también define algunos scripts básicos:

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

## Preparando el proyecto para GitHub

### Creando el repositorio

Durante la creación del proyecto Astro, optamos por no inicializar un nuevo repositorio para el proyecto. Por lo tanto, debemos hacerlo manualmente. Para ello, ejecuta el comando:
```bash
git init
```

Para utilizar GitHub Pages como un **sitio personal**, el nombre del repositorio sigue una convención específica:
```text
<tu-usuario>.github.io
```

En mi caso, por ejemplo, el repositorio es:
```text
dougcosta.github.io
```

Crea en GitHub un nuevo repositorio vacío para el proyecto, sin añadir un README, `.gitignore` u otros archivos iniciales, ya que el proyecto ya existe localmente. Después conecta el directorio con él (presta atención a utilizar las configuraciones específicas de tu directorio):
```bash
git branch -M main
git remote add origin https://github.com/<tu-usuario>/<tu-usuario>.github.io.git
```

Como estamos utilizando npm, `package-lock.json` también debe versionarse. Registra las versiones de las dependencias utilizadas por el proyecto y permite que la instalación se reproduzca de forma más consistente. La action de Astro lo utiliza durante el proceso de build. Por lo tanto, asegúrate de que no esté incluido en el archivo `.gitignore`.

### Configurando la dirección del sitio en Astro

Astro necesita conocer la URL pública del sitio.

Esta configuración se realiza en el archivo **`astro.config.mjs`**, que se encuentra en la raíz del proyecto.

La propiedad `site` debe recibir la URL pública. En mi caso será [https://dougcosta.github.io](https://dougcosta.github.io); modifícala según la que hayas definido:
```js
export default defineConfig({
  site: 'https://dougcosta.github.io',
});
```

La propiedad `site` es utilizada por Astro para generar URLs absolutas cuando sea necesario.

Como el repositorio sigue la convención de un sitio personal de GitHub Pages, el sitio se publicará directamente en la raíz del dominio:
```text
https://dougcosta.github.io/
```

---

## Publicando en GitHub Pages

### Configurando GitHub Actions

Hasta aquí, hemos podido ejecutar el proyecto localmente y preparar el repositorio para el versionado y la publicación automática.

GitHub Pages puede alojar el resultado estático generado por Astro, mientras que GitHub Actions puede ejecutar automáticamente el proceso de build y deploy.

Para ello, es necesario crear manualmente el archivo **`.github/workflows/deploy.yml`** e incluir el siguiente contenido, que configura un workflow básico para este proyecto:
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

El workflow se ejecuta automáticamente cada vez que se produce un `push` en la rama `main`.

También existe la opción `workflow_dispatch`, que permite iniciar el workflow manualmente desde la interfaz de GitHub.

La action de Astro instala las dependencias, ejecuta el build y realiza la carga del artefacto.

Primero, el job `build`:

```text
Checkout del código
       ↓
Instalación de las dependencias
       ↓
Build de Astro
       ↓
Carga del artefacto
```

Después, el job `deploy` utiliza el artefacto generado para publicarlo en GitHub Pages.

### Configurando GitHub Pages

En GitHub, entramos en el repositorio del proyecto y accedemos a:
```text
Settings → Pages
```

En `Build and deployment`, seleccionamos `GitHub Actions` como fuente de publicación.

### Haciendo el primer push

Antes de enviar los cambios a `main`, es una buena práctica validar localmente el build de producción.

```bash
npm run build
```

Si el build finaliza sin errores, podemos enviar el código a GitHub.

Después del push a la rama `main`, GitHub Actions detectará el cambio e iniciará automáticamente el workflow.

Añadimos los archivos al control de versiones:
```bash
git add .
```

Creamos el primer commit:
```bash
git commit -m "Initial commit"
```

Subimos los cambios al servidor:
```bash
git push -u origin main
```

### El proceso de build y deploy

A partir de este momento, el proceso de publicación deja de depender de una ejecución manual.

Siempre que haya un nuevo `push` en la rama `main`:

```text
git push
    ↓
GitHub
    ↓
GitHub Actions
    ↓
Build de Astro
    ↓
Artefacto del sitio
    ↓
GitHub Pages
    ↓
Sitio actualizado
```

Esto significa que, después de la configuración inicial, publicar un cambio en el sitio pasa a ser prácticamente una consecuencia natural del flujo de desarrollo.

Al final de este proceso, tenemos un sitio Astro publicado en GitHub Pages y un proceso automatizado de build y deploy.

El código permanece versionado en GitHub y cada cambio enviado a la rama `main` genera una nueva versión en producción, publicada automáticamente.

---

## Conclusión

Crear y publicar un sitio utilizando Astro y GitHub Pages es un proceso muy sencillo. Gran parte de los pasos descritos aquí está relacionada con la preparación del entorno y la instalación de los requisitos previos. Solo fueron necesarios algunos comandos para que Astro funcionara localmente.

A partir de una plantilla lista, versionamos el código y configuramos una rutina de build y deploy utilizando GitHub Actions, dando como resultado un sitio estático con un proceso de publicación automatizado y sin necesidad de mantener un servidor propio.

Para quienes comenzaron a trabajar con desarrollo de software hace dos décadas, la diferencia resulta especialmente interesante. Al comienzo de mi carrera, poner un sitio en Internet implicaba muchas más etapas de configuración, infraestructura y publicación. Hoy es posible pasar de un directorio vacío a un sitio publicado y automatizado en relativamente pocos pasos. Creo que esta simplicidad es algo muy interesante del desarrollo web moderno.

## Referencias

Las documentaciones oficiales utilizadas como referencia para este artículo son:

- [Astro — Instalación y configuración](https://docs.astro.build/pt-br/install-and-setup/)
- [Astro — Publicando en GitHub Pages](https://v6.docs.astro.build/en/guides/deploy/github/)
- [Node.js — Descarga e instalación](https://nodejs.org/pt-br/download)
- [GitHub Docs — Creando un repositorio](https://docs.github.com/en/repositories/creating-and-managing-repositories/quickstart-for-repositories)
- [GitHub Docs — Creando un sitio con GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [GitHub Docs — GitHub Pages: inicio rápido](https://docs.github.com/en/pages/quickstart)

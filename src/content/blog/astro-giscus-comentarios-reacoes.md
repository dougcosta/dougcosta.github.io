---
title: "Adicionando comentários e reações aos posts com Giscus no Astro"
description: "Como adicionei comentários e reações aos posts do meu site Astro usando Giscus e GitHub Discussions."
pubDate: 2026-09-18
lang: pt-BR
translationKey: astro-giscus-comments-reactions
tags:
  - Astro
  - Giscus
  - GitHub
  - Comments
  - JavaScript
draft: true
---

## Por que adicionar comentários ao blog?

Depois de implementar algumas funcionalidades no meu blog, senti falta de uma forma de permitir que os leitores interagissem diretamente com os artigos.

Para um blog técnico, comentários podem ser úteis não apenas para receber opiniões, mas também para tirar dúvidas, complementar uma explicação ou apontar alguma informação que possa ser melhorada.

Eu também queria permitir reações aos artigos, sem precisar criar toda uma infraestrutura própria para armazenar usuários, comentários e reações.

A partir daí, comecei a procurar uma solução que pudesse ser integrada ao Astro sem transformar o projeto em uma aplicação com backend.

## As opções que considerei

Existem algumas alternativas para implementar comentários em um site estático. Entre elas estão soluções que possuem backend próprio, como o Waline, além da possibilidade de desenvolver uma API e armazenar os comentários em um banco de dados.

Mas, para o meu caso, uma solução baseada no próprio GitHub fazia bastante sentido.

O site já está hospedado no GitHub Pages e o código está em um repositório do GitHub. O Giscus utiliza o GitHub Discussions para armazenar as discussões e permite incorporar essa funcionalidade ao site.

Foi a solução que escolhi.

## Preparando o GitHub

Antes de configurar o Giscus, é necessário habilitar o GitHub Discussions no repositório.

No GitHub, acessamos:

**Settings → Features**

Procuramos pelo bloco **Discussions** e habilitamos essa opção.

Depois, clicamos em **Set up discussions**.

A interface do GitHub pode mudar com o tempo, mas esse foi o caminho e o nome da opção que encontrei durante a configuração.

Ao habilitar **Discussions** e clicar no botão **Set up discussions**, abriu-se uma tela para selecionar o repositório e instalar a ferramenta.

Selecionamos o repositório e seguimos. No meu caso é:
```text
dougcosta/dougcosta.github.io
```

Depois disso, o repositório passou a ter a aba **Discussions**.

### Instalando o Giscus

Também foi necessário instalar o GitHub App do Giscus e permitir seu acesso ao repositório.

Depois da instalação, acessamos a aba **Discussions** do repositório.

O Giscus trabalha com categorias dentro do GitHub Discussions. Para configurar a categoria que seria usada pelos comentários do blog, acessamos **Categories**, na barra lateral esquerda.

Ao lado de **Categories** existe um botão com o ícone de lápis para editar as categorias.

Vamos criar uma categoria chamada:

**Blog Comments**

Essa categoria será utilizada pelo Giscus para criar as discussões correspondentes aos comentários dos artigos.

## Configurando o Giscus

Com o GitHub preparado, vamos para o configurador do Giscus.

A configuração final deve ficar assim:

- Idioma: **Português**
- Repositório: **`dougcosta/dougcosta.github.io`**
- Categoria: **Blog Comments**
- Procure apenas discussões nesta categoria: **habilitado**
- Mapeamento: **Título da discussão contém o `pathname` da página**
- Reações: **habilitadas**
- Emitir metadados de discussão: **desabilitado**
- Caixa de comentários: **abaixo dos comentários**
- Carregamento: **lazy**
- Tema: **Esquema de cores preferido**

O valor da configuração **Categoria** precisa ser exatamente o mesmo da categoria criada no GitHub, na aba **Discussions**. Em ambos os casos, utilizamos o valor **Blog Comments**.

O Giscus também forneceu os identificadores específicos do repositório e da categoria, representados pelos identificadores **`data-repo-id`** e **`data-category-id`**. Os valores são específicos da configuração de cada repositório.

## Criando o componente Giscus

Em vez de colocar o código do Giscus diretamente no layout dos posts, vamos criar um componente específico:

```text
src/components/Giscus.astro
```

Agora, dentro do arquivo `src/components/Giscus.astro`, colocamos a configuração do Giscus, a lógica necessária para inicializá-lo e ajustamos o seu posicionamento via código:

```astro
<div
	class="giscus"
	data-repo="dougcosta/dougcosta.github.io"
	data-repo-id="R_kgDOUVoXSQ"
	data-category="Blog Comments"
	data-category-id="DIC_kwDOUVoXSc4DF52f"
	data-mapping="pathname"
	data-strict="0"
	data-reactions-enabled="1"
	data-emit-metadata="0"
	data-input-position="bottom"
	data-lang='pt'
	data-loading="lazy"
></div>

<script>
	const giscus = document.querySelector('.giscus');

	if (giscus) {
		const root = document.documentElement;
		const media = window.matchMedia('(prefers-color-scheme: dark)');

		const getTheme = () =>
			root.dataset.theme || (media.matches ? 'dark' : 'light');

		const sendTheme = (iframe: HTMLIFrameElement) => {
			iframe.contentWindow?.postMessage(
				{
					giscus: {
						setConfig: {
							theme: getTheme(),
						},
					},
				},
				'https://giscus.app',
			);
		};

		const script = document.createElement('script');

		script.src = 'https://giscus.app/client.js';
		script.setAttribute('data-repo', giscus.getAttribute('data-repo')!);
		script.setAttribute('data-repo-id', giscus.getAttribute('data-repo-id')!);
		script.setAttribute('data-category', giscus.getAttribute('data-category')!);
		script.setAttribute('data-category-id', giscus.getAttribute('data-category-id')!);
		script.setAttribute('data-mapping', giscus.getAttribute('data-mapping')!);
		script.setAttribute('data-strict', giscus.getAttribute('data-strict')!);
		script.setAttribute('data-reactions-enabled', giscus.getAttribute('data-reactions-enabled')!);
		script.setAttribute('data-emit-metadata', giscus.getAttribute('data-emit-metadata')!);
		script.setAttribute('data-input-position', giscus.getAttribute('data-input-position')!);
		script.setAttribute('data-theme', getTheme());
		script.setAttribute('data-lang', giscus.getAttribute('data-lang')!);
		script.setAttribute('data-loading', giscus.getAttribute('data-loading')!);
		script.setAttribute('crossorigin', 'anonymous');
		script.async = true;

		giscus.appendChild(script);

		const iframeObserver = new MutationObserver(() => {
			const iframe = giscus.querySelector<HTMLIFrameElement>('iframe.giscus-frame');

			if (!iframe) return;

			iframe.addEventListener('load', () => {
				sendTheme(iframe);
			}, { once: true });

			iframeObserver.disconnect();
		});

		iframeObserver.observe(giscus, {
			childList: true,
			subtree: true,
		});

		const themeObserver = new MutationObserver(() => {
			const iframe = giscus.querySelector<HTMLIFrameElement>('iframe.giscus-frame');

			if (iframe) {
				sendTheme(iframe);
			}
		});

		themeObserver.observe(root, {
			attributes: true,
			attributeFilter: ['data-theme'],
		});

		media.addEventListener('change', () => {
			if (!root.dataset.theme) {
				const iframe = giscus.querySelector<HTMLIFrameElement>('iframe.giscus-frame');

				if (iframe) {
					sendTheme(iframe);
				}
			}
		});
	}
</script>

<style>
	.giscus {
		max-width: var(--width-prose);
		margin-top: var(--space-16);
		padding-top: var(--space-8);
		border-top: 1px solid var(--color-rule);
	}
</style>
```
A primeira parte define as propriedades do Giscus e carrega o script do serviço. 
Essas propriedades estão disponíveis na área de configuração do portal do Giscus. Podemos copiar os valores gerados pelo configurador e colocá-los no nosso código.

```astro
<div
	class="giscus"
	data-repo="dougcosta/dougcosta.github.io"
	data-repo-id="R_kgDOUVoXSQ"
	data-category="Blog Comments"
	data-category-id="DIC_kwDOUVoXSc4DF52f"
	data-mapping="pathname"
	data-strict="0"
	data-reactions-enabled="1"
	data-emit-metadata="0"
	data-input-position="bottom"
	data-lang={giscusLang}
	data-loading="lazy"
></div>
```

A parte em JavaScript cuida da inicialização e da sincronização do tema com o site. O CSS apenas posiciona a área de comentários de acordo com o restante do layout.

```astro
<script>
	const giscus = document.querySelector('.giscus');

	if (giscus) {
		const root = document.documentElement;
		const media = window.matchMedia('(prefers-color-scheme: dark)');

		const getTheme = () =>
			root.dataset.theme || (media.matches ? 'dark' : 'light');

		// Inicialização do Giscus e sincronização do tema...
		...
	}
</script>

<style>
	.giscus {
		max-width: var(--width-prose);
		margin-top: var(--space-16);
		padding-top: var(--space-8);
		border-top: 1px solid var(--color-rule);
	}
</style>
```

O ponto mais importante é que todo esse código fica concentrado em `src/components/Giscus.astro`. Assim, o layout dos posts precisa apenas renderizar o componente.

Uma decisão importante aqui foi manter o carregamento como `lazy`.

Isso significa que o Giscus não precisa carregar imediatamente quando o usuário abre o artigo. O componente é carregado quando o leitor se aproxima da área de comentários.

Para um site estático, esse comportamento ajuda a evitar carregar o iframe de comentários antes de ele ser necessário.

Para carregar o iframe junto com a página, esse parâmetro deve receber o valor `eager`.

## Caso o site tenha múltiplos idiomas

Esta parte é uma peculiaridade do meu site, que possui suporte a múltiplos idiomas. Se estivermos trabalhando com um site de apenas um idioma, podemos ignorar este tópico.

Como o componente precisa identificar o locale atual do site, fazemos isso através do código abaixo:
```astro
---
import type { Locale } from '../i18n';

type Props = {
	lang: Locale;
};

const { lang } = Astro.props;

const giscusLang = lang === 'pt-BR' ? 'pt' : lang;
---
```

O locale usado internamente pelo site é `pt-BR`, surgindo a necessidade de fazer o seguinte mapeamento:

```text
pt-BR → pt
en    → en
fr    → fr
es    → es
```

Que foi representado no código através dessa linha:
```javascript
const giscusLang = lang === 'pt-BR' ? 'pt' : lang;
```

Dessa forma, o atributo `data-lang` das propriedades do Giscus passa a receber o valor da constante `giscusLang`, não mais o valor fixo `pt`.
```javascript
<div
	...
	data-lang={giscusLang}
	...
></div>
```

O código completo com a implementação do locale fica assim:

```astro
---
import type { Locale } from '../i18n';

type Props = {
	lang: Locale;
};

const { lang } = Astro.props;

const giscusLang = lang === 'pt-BR' ? 'pt' : lang;
---

<div
	class="giscus"
	data-repo="dougcosta/dougcosta.github.io"
	data-repo-id="R_kgDOUVoXSQ"
	data-category="Blog Comments"
	data-category-id="DIC_kwDOUVoXSc4DF52f"
	data-mapping="pathname"
	data-strict="0"
	data-reactions-enabled="1"
	data-emit-metadata="0"
	data-input-position="bottom"
	data-lang={giscusLang}
	data-loading="lazy"
></div>

<script>
	const giscus = document.querySelector('.giscus');

	if (giscus) {
		const root = document.documentElement;
		const media = window.matchMedia('(prefers-color-scheme: dark)');

		const getTheme = () =>
			root.dataset.theme || (media.matches ? 'dark' : 'light');

		const sendTheme = (iframe: HTMLIFrameElement) => {
			iframe.contentWindow?.postMessage(
				{
					giscus: {
						setConfig: {
							theme: getTheme(),
						},
					},
				},
				'https://giscus.app',
			);
		};

		const script = document.createElement('script');

		script.src = 'https://giscus.app/client.js';
		script.setAttribute('data-repo', giscus.getAttribute('data-repo')!);
		script.setAttribute('data-repo-id', giscus.getAttribute('data-repo-id')!);
		script.setAttribute('data-category', giscus.getAttribute('data-category')!);
		script.setAttribute('data-category-id', giscus.getAttribute('data-category-id')!);
		script.setAttribute('data-mapping', giscus.getAttribute('data-mapping')!);
		script.setAttribute('data-strict', giscus.getAttribute('data-strict')!);
		script.setAttribute('data-reactions-enabled', giscus.getAttribute('data-reactions-enabled')!);
		script.setAttribute('data-emit-metadata', giscus.getAttribute('data-emit-metadata')!);
		script.setAttribute('data-input-position', giscus.getAttribute('data-input-position')!);
		script.setAttribute('data-theme', getTheme());
		script.setAttribute('data-lang', giscus.getAttribute('data-lang')!);
		script.setAttribute('data-loading', giscus.getAttribute('data-loading')!);
		script.setAttribute('crossorigin', 'anonymous');
		script.async = true;

		giscus.appendChild(script);

		const iframeObserver = new MutationObserver(() => {
			const iframe = giscus.querySelector<HTMLIFrameElement>('iframe.giscus-frame');

			if (!iframe) return;

			iframe.addEventListener('load', () => {
				sendTheme(iframe);
			}, { once: true });

			iframeObserver.disconnect();
		});

		iframeObserver.observe(giscus, {
			childList: true,
			subtree: true,
		});

		const themeObserver = new MutationObserver(() => {
			const iframe = giscus.querySelector<HTMLIFrameElement>('iframe.giscus-frame');

			if (iframe) {
				sendTheme(iframe);
			}
		});

		themeObserver.observe(root, {
			attributes: true,
			attributeFilter: ['data-theme'],
		});

		media.addEventListener('change', () => {
			if (!root.dataset.theme) {
				const iframe = giscus.querySelector<HTMLIFrameElement>('iframe.giscus-frame');

				if (iframe) {
					sendTheme(iframe);
				}
			}
		});
	}
</script>

<style>
	.giscus {
		max-width: var(--width-prose);
		margin-top: var(--space-16);
		padding-top: var(--space-8);
		border-top: 1px solid var(--color-rule);
	}
</style>
```

Dessa forma, o componente consegue acompanhar o idioma da página.

## Integrando ao layout dos posts

Com o componente pronto, é hora de adicioná-lo ao layout que renderiza os artigos.

No arquivo **`src/layouts/BlogPost.astro`**, primeiro adicionamos o import junto aos demais imports do frontmatter, no início do arquivo:

```astro
import Giscus from '../components/Giscus.astro';
```

Depois, ainda no mesmo arquivo, localizamos o conteúdo do artigo, que atualmente termina com:

```astro
<div class="prose"><slot /></div>
```

Logo **depois desse `<div>`**, e ainda dentro do `<article class="post wrap">`, adicionamos:

```astro
<Giscus lang={post.data.lang} />
```

O resultado fica assim:

```astro
<div class="prose"><slot /></div>
<Giscus lang={post.data.lang} />
```

Dessa forma, o Giscus aparece depois do conteúdo do artigo, mas fora da área `.prose`.

Essa separação foi importante porque o Giscus não faz parte propriamente do conteúdo Markdown. Ele é uma funcionalidade do layout do post.

## O problema do tema claro e escuro

Aqui apareceu um problema interessante.

O site possui seu próprio sistema de tema claro e escuro, controlado pelo atributo `data-theme` no elemento `<html>`.

As alterações para resolver isso ficam no arquivo **`src/components/Giscus.astro`**, dentro do bloco `<script>` do componente. Não é necessário alterar o `BlogPost.astro` para essa parte.

Inicialmente, o Giscus estava configurado com:

```text
preferred_color_scheme
```

Isso funcionava de acordo com a preferência de tema do sistema operacional, mas não acompanhava corretamente a mudança feita pelo botão de tema do próprio site.

Por exemplo, se o site estivesse em modo claro e eu clicasse no botão para mudar para o modo escuro, o site mudava, mas o Giscus poderia continuar no tema anterior.

Eu queria que os dois sistemas permanecessem sincronizados.

### Sincronizando os temas

Para resolver isso, passei a controlar o tema do Giscus por JavaScript.

A ideia é obter o tema atual do site:

```js
const getTheme = () =>
	root.dataset.theme || (media.matches ? 'dark' : 'light');
```

E enviá-lo para o iframe do Giscus usando `postMessage`:

```js
const sendTheme = (iframe) => {
	iframe.contentWindow?.postMessage(
		{
			giscus: {
				setConfig: {
					theme: getTheme(),
				},
			},
		},
		'https://giscus.app',
	);
};
```

Também adicionei um `MutationObserver` para observar alterações no atributo `data-theme`:

```js
themeObserver.observe(root, {
	attributes: true,
	attributeFilter: ['data-theme'],
});
```

Assim, quando o tema do site muda, o Giscus recebe a mesma configuração.

## Um detalhe importante: o timing do iframe

Essa parte acabou sendo um pouco mais interessante do que eu esperava.

Na primeira implementação, eu tentava enviar a mensagem para o iframe assim que ele era encontrado no DOM.

Isso gerava erros no Console relacionados ao `postMessage`, porque encontrar o iframe não significava necessariamente que ele já estivesse pronto para receber a mensagem.

O erro aparecia durante o desenvolvimento local com uma mensagem relacionada à origem:

```text
Unable to post message to https://giscus.app. Recipient has origin http://localhost:4321
```

A solução foi aguardar o carregamento do iframe antes de enviar a primeira configuração de tema.

Usei um `MutationObserver` para detectar a criação do iframe e, depois, o evento `load`:

```js
const iframeObserver = new MutationObserver(() => {
	const iframe =
		giscus.querySelector('iframe.giscus-frame');

	if (!iframe) return;

	iframe.addEventListener(
		'load',
		() => {
			sendTheme(iframe);
		},
		{ once: true },
	);

	iframeObserver.disconnect();
});
```

Depois dessa alteração, o erro deixou de aparecer no Console.

Esse foi um daqueles casos em que a implementação parecia correta, mas o problema estava no momento em que a comunicação estava sendo feita.

## Testando os comentários

Depois da implementação, fiz alguns testes no ambiente local.

O primeiro teste foi autenticar pelo GitHub e publicar um comentário.

Ao publicar o primeiro comentário de um artigo, o Giscus criou automaticamente uma discussão correspondente no GitHub Discussions, dentro da categoria **Blog Comments**.

No meu caso, a primeira discussão criada foi:

```text
blog/astro-links-em-nova-aba/
```

Também testei responder ao comentário diretamente pelo GitHub e confirmei que a resposta aparecia no componente incorporado ao artigo.

## Testando as reações

As reações também foram habilitadas no configurador do Giscus.

Fiz o teste diretamente no artigo e confirmei que a contagem da reação era atualizada.

Isso permite que o leitor interaja com o conteúdo sem necessariamente precisar escrever um comentário.

## Testando o carregamento lazy

Também validei o comportamento do carregamento lazy.

Ao abrir o artigo, o Giscus não era carregado imediatamente. Ele era inicializado quando eu chegava próximo da área de comentários.

Esse comportamento está de acordo com a configuração:

```text
data-loading="lazy"
```

## Testando os temas

Por fim, testei a troca entre os temas claro e escuro.

O site e o Giscus passaram a acompanhar a mesma configuração de tema.

Também repeti os testes no ambiente de produção.

Além dos testes funcionais, verifiquei o Console do navegador e confirmei que não havia mais os erros relacionados ao `postMessage`.

## Uma solução simples, mas com alguns detalhes

No final, a implementação do Giscus ficou relativamente pequena.

A maior parte do trabalho foi configurar corretamente o GitHub Discussions, criar a categoria e integrar o componente ao layout do Astro.

O ponto que exigiu mais atenção foi a sincronização do tema.

Também achei interessante o fato de que o Giscus consegue aproveitar uma infraestrutura que eu já utilizava: GitHub, GitHub Discussions e GitHub Pages.

Isso evita adicionar um backend, banco de dados ou sistema próprio de autenticação ao projeto.

## Conclusão

No meu ponto de vista, o Giscus acabou sendo uma solução bastante natural para o meu blog.

Como o projeto já está hospedado no GitHub Pages e o código está em um repositório do GitHub, utilizar o GitHub Discussions como base para os comentários reduz bastante a complexidade da implementação.

A integração com Astro também acabou sendo simples. Criei um componente específico para o Giscus, passei o idioma do post para ele e o adicionei ao layout dos artigos.

O único ponto que exigiu uma implementação adicional foi a sincronização do tema. Como o site possui seu próprio controle de tema, precisei sincronizar o `data-theme` do documento com o iframe do Giscus usando `postMessage`.

Depois dos ajustes e dos testes, passei a ter comentários e reações funcionando nos artigos, autenticação pelo GitHub e carregamento lazy, sem precisar criar uma infraestrutura própria para essa funcionalidade.

Para um blog técnico pessoal, foi uma solução que se encaixou bem na arquitetura que eu já tinha construído.

## Links úteis

Se você ainda não possui um site e quer criar um utilizando Astro, veja o artigo:

- [Construindo um site com Astro e publicando no GitHub Pages com GitHub Actions](../construindo-site-astro-github-pages/)


Se você quer que os links do seu site Astro abram em uma nova aba, veja o artigo:

- [Fazendo links externos dos posts abrirem em uma nova aba no Astro](../astro-links-em-nova-aba/)


## Referências

As principais referências utilizadas para esta implementação foram as documentações oficiais do Giscus, do GitHub e do Astro:

- [Giscus — configurador](https://giscus.app/pt)
- [Giscus — GitHub](https://github.com/giscus/giscus)
- [Giscus — uso avançado](https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md)
- [GitHub Docs — Guia Rápido para Discussões do GitHub](https://docs.github.com/pt/discussions/quickstart)
- [GitHub Docs — Habilitar ou desabilitar discussões de GitHub para um repositório](https://docs.github.com/pt/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/enabling-or-disabling-github-discussions-for-a-repository)
- [GitHub Docs — Gerenciar categorias para discussões](https://docs.github.com/pt/discussions/managing-discussions-for-your-community/managing-categories-for-discussions)
- [Astro — Componentes](https://docs.astro.build/pt-br/basics/astro-components/)

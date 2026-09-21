---
title: "Configurando o Google Analytics em um site"
description: "Um guia prático para configurar o Google Analytics 4 e acompanhar o tráfego de um site."
lang: pt-BR
translationKey: google-analytics-sete-configuration
pubDate: 2026-09-21
tags:
  - Google Analytics
  - Web
  - JavaScript
  - Astro
draft: false
---

## Introdução

O desejo principal ao colocar um site ou aplicativo no ar é que ele seja acessado e que se crie um público engajado. É através de dados que conseguimos avaliar se esse desejo está se cumprindo e precisamos coletá-los de alguma forma.

Dados como o número de visitantes, quais páginas ou telas são mais acessadas, de onde vêm os visitantes e como eles navegam pelo conteúdo são alguns dos indicadores que nos ajudam a entender o interesse do público e a contribuir para a evolução do produto.

Para acompanhar essas informações, podemos utilizar o **Google Analytics 4 (GA4)**.

Neste artigo, vamos configurar o Google Analytics em um site, desde a criação da conta até a validação da coleta de dados.

O exemplo utilizado neste artigo foi feito em um site construído com Astro e publicado no GitHub Pages. Entretanto, a configuração do Google Analytics apresentada aqui pode ser utilizada em diferentes tecnologias e plataformas. O que muda é principalmente a forma de inserir a tag no código do site.

## Criando e configurando uma conta no Google Analytics

### Criando a conta

O primeiro passo é acessar o Google Analytics: [Google Analytics](https://analytics.google.com/).

Entre com a conta Google que será utilizada para administrar o Analytics. Caso ainda não exista uma conta do Google Analytics, será necessário criar uma.

### Criando uma propriedade

O próximo passo é criar uma propriedade. A propriedade representa o conjunto de dados que queremos analisar dentro do Google Analytics. É o local onde os dados coletados pelo Google Analytics serão organizados. No caso desse exemplo, é onde acessaremos os dados do nosso site.

Sendo assim, podemos nomear a propriedade com o nome do site. Por exemplo:

```text
Meu Novo Website
```

### Categorizando a propriedade

Durante essa etapa, o Google Analytics solicita algumas informações que podem parecer direcionadas a empresas, como o setor de atuação e o tamanho da empresa.

Essa etapa pode causar alguma dúvida quando estamos configurando o Analytics para um site pessoal.

Mesmo que não tenhamos uma empresa, essas perguntas fazem parte do processo de configuração do Google Analytics.

No meu caso, por se tratar de um site pessoal relacionado a tecnologia, escolhi a categoria de setor mais próxima de **Tecnologia/Software**.

Para o tamanho da empresa, utilizei a opção **Pequena**, por ser a alternativa mais próxima da realidade de um site pessoal.

Não é necessário ter uma empresa formal, CNPJ ou uma estrutura empresarial para utilizar o Google Analytics em um site pessoal.

### Configurando o fuso horário e a moeda

Durante a configuração da propriedade, também precisamos definir o fuso horário e a moeda.

Escolha o fuso horário correspondente à região que será utilizada como referência para os seus relatórios.

Por exemplo:

```text
Fuso horário: (GMT-03:00) São Paulo
Moeda: BRL — Real brasileiro
```

O fuso horário é importante porque influencia a forma como os dados são agrupados por dia nos relatórios.

## Criando um fluxo de dados

Depois de criar a propriedade, precisamos informar ao Google Analytics de onde os dados serão coletados.

Para um site, devemos criar um fluxo de dados do tipo **Web**.

Devemos informar a URL do site que será monitorado. No exemplo deste artigo:

```text
https://meunovowebsite.com
```

Também podemos definir um nome para o fluxo:

```text
Novo Website
```

Durante essa configuração, mantenha a **Medição otimizada** ativada.

Ela permite que o Google Analytics colete automaticamente determinados eventos e informações sobre a navegação sem que seja necessário implementar cada evento manualmente.

Depois de criar o fluxo, o Google Analytics apresentará as informações do fluxo, incluindo o **ID de medição**.

O ID possui um formato semelhante a:

```text
G-XXXXXXXXXX
```

Esse identificador será utilizado pela tag instalada no site.

## Instalando a tag do Google

Depois de criar o fluxo Web, o Google Analytics apresenta a opção para instalar a tag do Google no site (não feche essa página/aba. Adiante voltaremos a ela para validar a instalação).

A tag precisa ser adicionada ao código das páginas que serão monitoradas.

O Google fornece um código semelhante a este:

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

Substitua `G-XXXXXXXXXX` pelo ID de medição gerado para o seu fluxo Web. A sugestão é que esse código seja copiado diretamente do Google Analytics, não desse artigo. Dessa forma, não precisamos nos preocupar em substituir esse ID.

A forma de inserir esse código depende da tecnologia utilizada pelo site.

Se o site utilizar HTML diretamente, por exemplo, a tag pode ser adicionada ao `<head>` de **todas** as páginas. As páginas que não receberem essa tag não terão dados coletados.

Se o site utilizar algum framework ou gerador de sites, normalmente existe um layout, template ou componente compartilhado que pode ser utilizado para inserir o código uma única vez, que é o meu caso. Eu estou utilizando o Astro. Incluí a tag no layout compartilhado pelas páginas do site, garantindo que ela esteja presente em todas as páginas. Dessa forma, nenhuma página ficará sem o código, mesmo as novas páginas que surgirem no futuro.

É importante garantir que esse código seja executado somente em produção. Caso contrário, os acessos realizados durante o desenvolvimento ou em ambientes de homologação também poderão ser contabilizados pelo Google Analytics, afetando as métricas.

No meu caso, incluí uma condição que verifica se o ambiente atual é o de produção (**`import.meta.env.PROD`**) para escrever o código do GA:
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

## Testando a instalação

Depois de publicar o site com a tag, podemos utilizar a própria ferramenta de verificação disponibilizada pelo Google Analytics.

Durante a configuração do fluxo, existe um botão chamado **Testar instalação**.

Utilize essa opção depois que a nova versão do site estiver publicada.

No exemplo deste artigo, o Google retornou:

> A tag do Google foi detectada no seu site.

Isso confirma que o Google conseguiu encontrar a tag na página.

O botão **Testar instalação** se transformou em **Confirmar**. Ao clicá-lo, o Google apresenta informações como:

- nome do fluxo;
- URL do fluxo;
- ID de medição.

Também pode aparecer uma mensagem informando que a coleta de dados ainda não está ativa. Algo como:
> A coleta de dados não está ativa no seu site. Se você instalou as tags há mais de 48 horas, verifique se elas estão configuradas corretamente.

Essa mensagem não significa necessariamente que a instalação esteja incorreta. A coleta precisa receber dados do site para que possa ser confirmada. Para uma verificação imediata, podemos utilizar o relatório **Tempo real**.

## Verificando a coleta de dados

Para fazer uma verificação mais completa, podemos utilizar o relatório **Tempo real** do Google Analytics.

Depois de publicar o site:

1. Abra o Google Analytics.
2. Acesse **Relatórios → Tempo real**.
3. Abra o site em outra aba ou janela do navegador.
4. Navegue por algumas páginas.
5. Aguarde alguns instantes.
6. Verifique se a atividade aparece no relatório.

No exemplo deste artigo, a atividade apareceu corretamente no relatório e a coleta de dados foi confirmada.

O relatório em tempo real é especialmente útil durante a configuração inicial porque permite verificar a atividade recente sem precisar esperar pela consolidação dos relatórios históricos.

## Mudando o domínio no futuro

É comum que um site comece utilizando um endereço fornecido pela plataforma de hospedagem e, posteriormente, passe a utilizar um domínio próprio.

Por exemplo, o site utilizado neste artigo pode inicialmente estar disponível em:

```text
https://meunovowebsite.com
```

e posteriormente passar a utilizar:

```text
https://meuwebsite.com
```

A mudança de domínio não significa necessariamente que precisamos criar uma nova propriedade no Google Analytics. Podemos continuar utilizando a propriedade existente e preservar o histórico de dados já coletado.

Quando o novo domínio estiver configurado, podemos atualizar a URL do fluxo Web existente e continuar utilizando o mesmo ID de medição.

O código instalado no site também poderá continuar utilizando o mesmo ID (`G-XXXXXXXXXX`).

Dessa forma, continuamos utilizando a mesma propriedade e o mesmo fluxo Web, preservando o histórico de dados já coletado.

## Conclusão

Configurar o Google Analytics em um site é um processo muito simples.

Primeiro criamos a conta e a propriedade, configuramos o fluxo Web e obtemos o ID de medição. Depois adicionamos a tag ao site, garantindo que ela seja executada apenas em ambiente produtivo, e fazemos uma publicação para que o código passe a estar disponível para os visitantes.

Por fim, utilizamos as ferramentas de verificação do próprio Google e o relatório em tempo real para confirmar que os dados estão sendo coletados.

A partir desse momento, começamos a ter uma visão mais clara de como o site está sendo utilizado. Conforme novos conteúdos forem publicados e o tráfego crescer, esses dados podem ajudar a entender quais páginas estão recebendo mais acessos e de onde vêm os visitantes.

## Links úteis

Se você ainda não possui um site e quer criar um utilizando Astro, veja também o artigo:

- [Construindo um site com Astro e publicando no GitHub Pages com GitHub Actions](../construindo-site-astro-github-pages/)

Se você utiliza o Astro e, assim como eu, quer que os links externos do seu site abram em uma nova aba, veja como fiz essa implementação no artigo:  

- [Fazendo links externos dos posts abrirem em uma nova aba no Astro](../astro-links-em-nova-aba/)

## Referências

As documentações utilizadas como referência para este artigo são:

- [Google Analytics — Configurar o Google Analytics](https://support.google.com/analytics/answer/14183469?hl=pt-BR)
- [Google Analytics — Instalar a tag do Google](https://support.google.com/analytics/answer/9744165?hl=pt-BR)
- [Google Analytics — Verificar a coleta de dados em tempo real](https://support.google.com/analytics/answer/9271392?hl=pt-BR)

---
description: Um passo a passo prático para comprar um domínio,
  configurar o DNS no Cloudflare, conectar o domínio ao GitHub Pages,
  habilitar HTTPS, atualizar o Google Analytics e validar sitemap e RSS.
draft: false
lang: pt-BR
pubDate: 2026-09-17
tags:
- GitHub Pages
- Cloudflare
- DNS
- HTTPS
- Astro
- Google Analytics
- Web
title: Configurando um domínio personalizado no GitHub Pages com
  Cloudflare
translationKey: dominio-personalizado-github-pages-cloudflare
---

Comprar um domínio próprio é uma daquelas etapas que parecem simples até
o momento em que você precisa decidir onde comprar, onde configurar o
DNS, quais registros criar, como conectar tudo ao GitHub Pages e,
principalmente, como garantir que HTTPS, Analytics e indexação continuem
funcionando.

Neste artigo, vou mostrar como fiz essa configuração no meu próprio
site, saindo de `https://dougcosta.github.io` para
`https://dougcosta.com`.

O site é construído com Astro e publicado no GitHub Pages através de
GitHub Actions. Para o domínio, escolhi o Cloudflare.

A ideia aqui não é apenas listar os cliques. Quero explicar também **o
que cada configuração significa e por que escolhi cada valor**, porque é
muito fácil copiar uma configuração de DNS sem entender o que está
acontecendo.

> **Importante:** os valores e telas podem mudar com o tempo. Os
> conceitos permanecem, mas vale conferir a documentação oficial dos
> serviços antes de aplicar a configuração.

## 1. Comprar o domínio

O primeiro passo é registrar o domínio que você pretende usar.

Existem vários registradores. Entre as opções que considerei estavam
GoDaddy e Cloudflare. Acabei escolhendo o **Cloudflare Registrar**
porque queria manter o registro do domínio e o DNS dentro do mesmo
ecossistema.

Além de simplificar a administração, o Cloudflare oferece uma interface
direta para gerenciar registros DNS.

No meu caso, comprei:

``` text
dougcosta.com
```

Uma observação importante: **registrador e DNS são conceitos
diferentes**.

-   O registrador é responsável pelo registro do domínio.
-   O DNS é responsável por dizer para onde aquele domínio deve apontar.
-   O GitHub Pages é onde o site está hospedado.

É perfeitamente possível registrar o domínio em uma empresa e
administrar o DNS em outra.

## 2. Por que escolhi o Cloudflare?

Minha arquitetura ficou assim:

``` text
                    ┌─────────────────────┐
                    │      Cloudflare     │
                    │ Registro + DNS      │
                    └──────────┬──────────┘
                               │ DNS
                               ▼
                    ┌─────────────────────┐
                    │    GitHub Pages     │
                    │     hospedagem      │
                    └──────────┬──────────┘
                               │
                               ▼
                     https://dougcosta.com
```

O Cloudflare não está hospedando o meu site. Neste cenário, ele está
principalmente cuidando do **registro do domínio e da resolução DNS**.

Para esta configuração, mantive os registros do GitHub Pages como **DNS
only**, sem passar o tráfego HTTP pelo proxy do Cloudflare.

## 3. Configurando o DNS no Cloudflare

Em **Cloudflare → domínio → DNS → Records**, criei quatro registros `A`:

  Type   Name   IPv4 address        Proxy status   TTL
  ------ ------ ------------------- -------------- ------
  A      `@`    `185.199.108.153`   DNS only       Auto
  A      `@`    `185.199.109.153`   DNS only       Auto
  A      `@`    `185.199.110.153`   DNS only       Auto
  A      `@`    `185.199.111.153`   DNS only       Auto

E também:

  Type    Name    Target                  Proxy status   TTL
  ------- ------- ----------------------- -------------- ------
  CNAME   `www`   `dougcosta.github.io`   DNS only       Auto

Esses são os valores documentados pelo GitHub Pages para apontar um
domínio apex para o GitHub Pages.

Referências:

-   [GitHub Pages --- Managing a custom
    domain](https://docs.github.com/pt/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
-   [Cloudflare --- DNS
    records](https://developers.cloudflare.com/dns/manage-dns-records/)

## 4. O que significa cada campo do Cloudflare?

### `Type`

Define o tipo do registro DNS.

Um registro `A` associa um nome a um endereço IPv4:

``` text
dougcosta.com → 185.199.108.153
```

Um `CNAME` aponta um nome DNS para outro nome DNS:

``` text
www.dougcosta.com → dougcosta.github.io
```

### `Name`

Para o domínio raiz usamos:

``` text
@
```

O `@` representa `dougcosta.com`.

Para o subdomínio usamos:

``` text
www
```

que representa `www.dougcosta.com`.

### `IPv4 address`

É o conteúdo do registro `A`.

O GitHub Pages fornece quatro endereços IPv4 para o domínio apex:

``` text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Não são quatro sites diferentes. São os endpoints publicados pelo GitHub
Pages para essa configuração.

O GitHub também documenta registros `AAAA` para IPv6. Nesta
configuração, usei os quatro registros `A` recomendados e não adicionei
`AAAA`.

### `Proxy status: DNS only`

No Cloudflare, `DNS only` é representado pela nuvem cinza.

Com `DNS only`, o Cloudflare responde pela resolução DNS, mas não atua
como proxy HTTP/HTTPS para o registro.

Escolhi isso porque queria usar o Cloudflare como registrador/DNS e
deixar o GitHub Pages cuidar da hospedagem e do HTTPS.

> **Não confunda DNS only com ausência de HTTPS.** O HTTPS do site
> continua sendo fornecido pelo GitHub Pages.

### `TTL: Auto`

TTL significa **Time To Live**. É o período durante o qual uma resposta
DNS pode permanecer armazenada em cache por resolvedores DNS.

Escolhi `Auto` porque não havia necessidade de controlar manualmente o
cache durante a configuração.

## 5. Por que configurar quatro IPs?

A documentação oficial do GitHub Pages recomenda os quatro registros `A`
para o domínio apex:

``` text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Não devemos escolher apenas um deles arbitrariamente.

O GitHub também documenta os quatro endereços IPv6 correspondentes, caso
você queira configurar `AAAA`:

``` text
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

Para uma configuração nova, confira sempre a documentação atual do
GitHub Pages.

## 6. Por que configurar o `www`?

Mesmo escolhendo `https://dougcosta.com` como endereço principal,
configurei `www`:

``` text
Type: CNAME
Name: www
Target: dougcosta.github.io
Proxy status: DNS only
TTL: Auto
```

Assim, o GitHub Pages reconhece também a variante `www`.

No final, configurei o site para que a URL canônica seja:

``` text
https://dougcosta.com
```

E o comportamento ficou:

``` text
http://dougcosta.com
        ↓
https://dougcosta.com

http://www.dougcosta.com
        ↓
https://www.dougcosta.com
        ↓
https://dougcosta.com
```

## 7. Configurando o domínio no GitHub Pages

No repositório:

**Settings → Pages → Custom domain**

informe:

``` text
dougcosta.com
```

e salve.

O GitHub verifica a configuração DNS e, quando ela está correta, inicia
o provisionamento do certificado HTTPS.

Referência:

-   [GitHub Pages --- Managing a custom
    domain](https://docs.github.com/pt/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

## 8. Ativando o Enforce HTTPS

Depois que o certificado foi provisionado, ative:

**Enforce HTTPS**

Isso é importante porque queremos que quem digitar:

``` text
http://dougcosta.com
```

seja direcionado para:

``` text
https://dougcosta.com
```

O GitHub Pages documenta essa opção como a forma de garantir que o site
seja servido somente por HTTPS.

Referência:

-   [GitHub Pages --- Securing your site with
    HTTPS](https://docs.github.com/pt/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)

## 9. Atualizando o Astro

Como o domínio público mudou, atualizei o `astro.config.mjs`:

``` js
export default defineConfig({
    site: 'https://dougcosta.com',
    // ...
});
```

Também atualizei a URL pública usada pelo projeto:

``` ts
export const SITE = {
    url: 'https://dougcosta.com',
    // ...
};
```

Depois executei:

``` bash
npm run build
```

e verifiquei se o build passou a usar `https://dougcosta.com`.

Uma busca útil para encontrar referências antigas é:

``` bash
grep -R "dougcosta.github.io" .   --exclude-dir=node_modules   --exclude-dir=.git   --exclude-dir=dist   --exclude-dir=.astro
```

No meu caso, as ocorrências restantes estavam apenas nos artigos que
documentam historicamente a configuração original do site.

## 10. Atualizando o Google Analytics

Se você já usa Google Analytics 4, não é necessário criar uma nova
propriedade apenas porque mudou o domínio.

No meu caso, mantive o mesmo fluxo Web e o mesmo Measurement ID.

No Google Analytics:

**Administrador → Fluxos de dados → selecione o fluxo Web → Editar**

Altere a URL de:

``` text
https://dougcosta.github.io
```

para:

``` text
https://dougcosta.com
```

O Google permite editar o URL de um fluxo Web existente, incluindo
protocolo, domínio e caminho.

Referência:

-   [Google Analytics --- Editar contas, propriedades e fluxos de
    dados](https://support.google.com/analytics/answer/9304776?hl=pt-BR)

## 11. Validando o sitemap

Depois do deploy, valide:

-   [Sitemap index](https://dougcosta.com/sitemap-index.xml)
-   [Sitemap principal](https://dougcosta.com/sitemap-0.xml)

O `sitemap-index.xml` é um índice de sitemaps. No meu caso, ele aponta
para:

``` text
sitemap-0.xml
```

A relação é:

``` text
sitemap-index.xml
        ↓
sitemap-0.xml
```

Já o `sitemap-0.xml` contém as URLs do site, como:

``` text
https://dougcosta.com/
https://dougcosta.com/about/
https://dougcosta.com/blog/
https://dougcosta.com/en/
https://dougcosta.com/fr/
https://dougcosta.com/es/
```

Ao validar, confira:

-   o arquivo abre;
-   as URLs usam `https://`;
-   o domínio novo aparece;
-   as páginas importantes estão presentes;
-   não há URLs antigas do `github.io`.

A mensagem do navegador dizendo que o XML não possui informação de
estilo é normal. Sitemap é XML para máquinas.

## 12. Validando o RSS

Também valide:

-   [RSS do site](https://dougcosta.com/rss.xml)

O RSS deve apontar para o domínio novo tanto no `<link>` principal
quanto nos links dos artigos.

Por exemplo:

``` xml
<link>https://dougcosta.com/</link>
```

e:

``` xml
<link>
    https://dougcosta.com/blog/construindo-site-astro-github-pages/
</link>
```

Isso é importante porque leitores de feed e outros consumidores podem
guardar essas URLs.

## 13. Validando os redirecionamentos

Faça estes quatro testes:

``` text
http://dougcosta.com
```

deve terminar em:

``` text
https://dougcosta.com
```

``` text
http://www.dougcosta.com
```

deve terminar em:

``` text
https://dougcosta.com
```

Também teste diretamente:

``` text
https://dougcosta.com
https://www.dougcosta.com
```

No meu caso, `https://www.dougcosta.com` também termina em
`https://dougcosta.com`, deixando uma única URL principal.

## 14. Uma observação sobre o GitHub Actions

Durante o deploy, o GitHub Actions pode apresentar uma URL do ambiente
parecida com:

``` text
http://dougcosta.com/
```

Isso não significa que o site esteja sendo publicado sem HTTPS.

Essa URL exibida pelo workflow é a URL associada ao deployment/ambiente.
O comportamento público de HTTPS depende da configuração do domínio no
GitHub Pages, do certificado e do **Enforce HTTPS**.

Por isso, não altere o workflow apenas por causa dessa URL.

## 15. Validando o DNS pelo terminal

O GitHub recomenda `dig` para verificar os registros DNS.

Para os registros `A`:

``` bash
dig dougcosta.com +noall +answer -t A
```

Você deve encontrar:

``` text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Para o `www`:

``` bash
dig www.dougcosta.com +noall +answer
```

Isso ajuda a separar problemas de DNS de problemas do site.

## 16. Checklist final

-   [x] Comprar o domínio
-   [x] Configurar o domínio no Cloudflare
-   [x] Criar os quatro registros `A`
-   [x] Criar o CNAME do `www`
-   [x] Usar `DNS only`
-   [x] Usar TTL `Auto`
-   [x] Configurar o Custom domain no GitHub Pages
-   [x] Aguardar a validação DNS
-   [x] Aguardar o certificado HTTPS
-   [x] Ativar **Enforce HTTPS**
-   [x] Atualizar `site` no Astro
-   [x] Atualizar a URL pública usada pelo projeto
-   [x] Fazer novo build e deploy
-   [x] Atualizar o URL do Web Stream no Google Analytics, quando
    aplicável
-   [x] Validar `sitemap-index.xml`
-   [x] Validar `sitemap-0.xml`
-   [x] Validar `rss.xml`
-   [x] Testar HTTP → HTTPS
-   [x] Testar `www` → domínio principal
-   [x] Procurar referências de configuração ao domínio antigo

## 17. Referências oficiais

### GitHub

-   [Managing a custom domain for your GitHub Pages
    site](https://docs.github.com/pt/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
-   [Securing your GitHub Pages site with
    HTTPS](https://docs.github.com/pt/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)

### Cloudflare

-   [DNS records --- Cloudflare
    Docs](https://developers.cloudflare.com/dns/manage-dns-records/)

### Google Analytics

-   [Editar contas, propriedades e fluxos de
    dados](https://support.google.com/analytics/answer/9304776?hl=pt-BR)

### Astro

-   [Astro ---
    Sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)

## 18. Outros artigos deste site

Se você está montando o próprio site com Astro, este artigo complementa
o passo a passo:

-   [Construindo um site com Astro e publicando no GitHub Pages com
    GitHub Actions](/blog/construindo-site-astro-github-pages/)

Nesse artigo mostro a configuração inicial do site e o processo de
publicação no GitHub Pages.

## Conclusão

A parte mais importante desta configuração, para mim, foi perceber que
um domínio personalizado não é apenas "comprar um domínio e colocar o
endereço no GitHub".

Existe uma pequena cadeia de responsabilidades:

``` text
Domínio
   ↓
DNS
   ↓
GitHub Pages
   ↓
HTTPS
   ↓
Site
   ↓
Analytics
   ↓
Sitemap + RSS
```

Quando alguma coisa nessa cadeia está errada, o problema pode aparecer
em lugares completamente diferentes.

Por isso, minha recomendação é fazer a configuração por etapas e validar
cada camada antes de passar para a próxima.

No final, o objetivo é simples:

``` text
https://dougcosta.com
```

ser a URL pública, segura e consistente do site, enquanto DNS,
hospedagem, HTTPS, analytics e mecanismos de busca trabalham em conjunto
por trás dela.

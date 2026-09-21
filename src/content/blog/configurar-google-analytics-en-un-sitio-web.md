---
title: "Configurar Google Analytics en un sitio web"
description: "Una guía práctica para configurar Google Analytics 4 y realizar un seguimiento del tráfico de un sitio web."
lang: es
translationKey: google-analytics-site-configuration
pubDate: 2026-09-21
tags:
  - Google Analytics
  - Web
  - JavaScript
  - Astro
draft: false
---

## Introducción

El objetivo principal al poner un sitio web o una aplicación en línea es conseguir visitas y crear una audiencia comprometida. Los datos nos permiten evaluar si estamos alcanzando ese objetivo, por lo que necesitamos alguna forma de recopilarlos.

Datos como el número de visitantes, qué páginas o pantallas reciben más visitas, de dónde proceden los visitantes y cómo navegan por el contenido son algunos de los indicadores que nos ayudan a entender el interés de la audiencia y a mejorar el producto.

Para hacer un seguimiento de esta información, podemos utilizar **Google Analytics 4 (GA4)**.

En este artículo, vamos a configurar Google Analytics en un sitio web, desde la creación de la cuenta hasta la validación de la recopilación de datos.

El ejemplo utilizado en este artículo corresponde a un sitio construido con Astro y publicado en GitHub Pages. Sin embargo, la configuración de Google Analytics que presentamos aquí puede utilizarse con diferentes tecnologías y plataformas. Lo que cambia principalmente es la forma de insertar el tag en el código del sitio.

## Crear y configurar una cuenta de Google Analytics

### Crear la cuenta

El primer paso es acceder a Google Analytics: [Google Analytics](https://analytics.google.com/).

Iniciemos sesión con la cuenta de Google que utilizaremos para administrar Analytics. Si todavía no existe una cuenta de Google Analytics, tendremos que crear una.

### Crear una propiedad

El siguiente paso es crear una propiedad. Una propiedad representa el conjunto de datos que queremos analizar dentro de Google Analytics. Es el lugar donde se organizan los datos recopilados por Google Analytics. En este ejemplo, es donde accederemos a los datos de nuestro sitio.

Podemos utilizar el nombre del sitio como nombre de la propiedad. Por ejemplo:

```text
Mi Nuevo Sitio Web
```

### Categorizar la propiedad

Durante esta etapa, Google Analytics solicita algunos datos que pueden parecer más orientados a empresas, como el sector de actividad y el tamaño de la empresa.

Esta etapa puede generar algunas dudas cuando configuramos Analytics para un sitio personal.

Aunque no tengamos una empresa, estas preguntas forman parte del proceso de configuración de Google Analytics.

En mi caso, como se trata de un sitio personal relacionado con la tecnología, elegí la categoría de sector más cercana a **Tecnología/Software**.

Para el tamaño de la empresa, seleccioné **Pequeña**, ya que era la opción más cercana a la realidad de un sitio personal.

No es necesario tener una empresa formal, un CNPJ ni una estructura empresarial para utilizar Google Analytics en un sitio personal.

### Configurar la zona horaria y la moneda

Durante la configuración de la propiedad, también debemos definir la zona horaria y la moneda.

Debemos elegir la zona horaria correspondiente a la región que utilizaremos como referencia para nuestros informes.

Por ejemplo:

```text
Zona horaria: (GMT-03:00) São Paulo
Moneda: BRL — Real brasileño
```

La zona horaria es importante porque influye en la forma en que los datos se agrupan por día en los informes.

## Crear un flujo de datos

Después de crear la propiedad, debemos indicar a Google Analytics de dónde se recopilarán los datos.

Para un sitio web, debemos crear un flujo de datos de tipo **Web**.

Debemos introducir la URL del sitio que queremos monitorizar. En el ejemplo de este artículo:

```text
https://meunovowebsite.com
```

También podemos definir un nombre para el flujo:

```text
Nuevo Sitio Web
```

Durante esta configuración, debemos mantener activada la **Medición mejorada**.

Esta opción permite que Google Analytics recopile automáticamente determinados eventos e información sobre la navegación sin que tengamos que implementar cada evento manualmente.

Después de crear el flujo, Google Analytics mostrará su información, incluido el **ID de medición**.

El ID tiene un formato similar a este:

```text
G-XXXXXXXXXX
```

Este identificador será utilizado por el tag instalado en el sitio.

## Instalar el Google tag

Después de crear el flujo de datos Web, Google Analytics ofrece una opción para instalar el Google tag en el sitio. No cerremos esta página o pestaña, porque volveremos a ella más adelante para validar la instalación.

El tag debe añadirse al código de las páginas que queremos monitorizar.

Google Analytics proporciona un código similar a este:

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

Debemos sustituir `G-XXXXXXXXXX` por el ID de medición generado para nuestro flujo de datos Web. Lo recomendable es copiar este código directamente desde Google Analytics y no desde este artículo. De esta forma, no tendremos que preocuparnos por sustituir manualmente el ID.

La forma de insertar este código depende de la tecnología utilizada por el sitio.

Si el sitio utiliza HTML directamente, por ejemplo, podemos añadir el tag al `<head>` de **todas** las páginas. Las páginas que no incluyan este tag no enviarán datos a Google Analytics.

Si el sitio utiliza un framework o un generador de sitios, normalmente existe un layout, template o componente compartido donde podemos insertar el código una sola vez. Eso es lo que hice en mi caso. Utilizo Astro, así que añadí el tag al layout compartido por las páginas del sitio, asegurándome de que esté presente en todas ellas. De esta forma, las nuevas páginas también incluirán el código automáticamente.

Es importante asegurarnos de que este código se ejecute únicamente en producción. De lo contrario, las visitas generadas durante el desarrollo o en entornos de staging también pueden contabilizarse en Google Analytics y afectar a las métricas.

En mi caso, añadí una condición que comprueba si el entorno actual es producción (**`import.meta.env.PROD`**) antes de generar el código de GA:

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

## Probar la instalación

Después de publicar el sitio con el tag, podemos utilizar las herramientas de verificación proporcionadas por Google Analytics.

Durante la configuración del flujo, encontramos un botón llamado **Probar instalación**.

Utilicemos esta opción después de publicar la nueva versión del sitio.

En el ejemplo de este artículo, Google mostró el siguiente mensaje:

> Se ha detectado el Google tag en tu sitio web.

Esto confirma que Google pudo encontrar el tag en la página.

El botón **Probar instalación** se convierte entonces en **Confirmar**. Al hacer clic en él, Google muestra información como:

- nombre del flujo;
- URL del flujo;
- ID de medición.

También puede aparecer un mensaje indicando que la recopilación de datos todavía no está activa. Por ejemplo:

> La recopilación de datos no está activa en tu sitio web. Si instalaste los tags hace más de 48 horas, comprueba que estén configurados correctamente.

Este mensaje no significa necesariamente que la instalación sea incorrecta. Google Analytics necesita recibir datos del sitio para poder confirmar la recopilación. Para realizar una comprobación inmediata, podemos utilizar el informe **Tiempo real**.

## Verificar la recopilación de datos

Para realizar una verificación más completa, podemos utilizar el informe **Tiempo real** de Google Analytics.

Después de publicar el sitio:

1. Abrimos Google Analytics.
2. Accedemos a **Informes → Tiempo real**.
3. Abrimos el sitio en otra pestaña o ventana del navegador.
4. Navegamos por algunas páginas.
5. Esperamos unos instantes.
6. Comprobamos si la actividad aparece en el informe.

En el ejemplo de este artículo, la actividad apareció correctamente en el informe y se confirmó que la recopilación de datos estaba funcionando.

El informe en tiempo real resulta especialmente útil durante la configuración inicial, ya que permite comprobar la actividad reciente sin tener que esperar a que se consoliden los informes históricos.

## Cambiar el dominio en el futuro

Es habitual que un sitio comience utilizando una dirección proporcionada por la plataforma de hosting y que, posteriormente, pase a utilizar un dominio personalizado.

Por ejemplo, el sitio utilizado en este artículo podría estar disponible inicialmente en:

```text
https://meunovowebsite.com
```

y posteriormente pasar a utilizar:

```text
https://misitio.com
```

Cambiar de dominio no significa necesariamente que tengamos que crear una nueva propiedad en Google Analytics. Podemos seguir utilizando la propiedad existente y conservar el historial de datos que ya se ha recopilado.

Una vez configurado el nuevo dominio, podemos actualizar la URL del flujo de datos Web existente y seguir utilizando el mismo ID de medición.

El código instalado en el sitio también puede seguir utilizando el mismo ID (`G-XXXXXXXXXX`).

De esta forma, podemos mantener la misma propiedad y el mismo flujo de datos Web, conservando el historial de datos ya recopilado.

## Conclusión

Configurar Google Analytics en un sitio web es un proceso bastante sencillo.

Primero creamos la cuenta y la propiedad, configuramos el flujo de datos Web y obtenemos el ID de medición. Después añadimos el tag al sitio, asegurándonos de que se ejecute únicamente en producción, y publicamos el sitio para que el código esté disponible para los visitantes.

Por último, utilizamos las herramientas de verificación de Google y el informe en tiempo real para confirmar que los datos se están recopilando.

A partir de ese momento, empezamos a tener una visión más clara de cómo se utiliza el sitio. A medida que publiquemos nuevos contenidos y aumente el tráfico, estos datos pueden ayudarnos a entender qué páginas reciben más visitas y de dónde proceden los visitantes.

## Enlaces útiles

Si todavía no tienes un sitio y quieres crear uno utilizando Astro, también puedes consultar el artículo:

- [Cómo crear un sitio con Astro y publicarlo en GitHub Pages con GitHub Actions](../crear-un-sitio-con-astro-y-github-pages/)

Si utilizas Astro y, al igual que yo, quieres que los enlaces externos de tu sitio se abran en una nueva pestaña, puedes ver cómo implementé esta funcionalidad en el artículo:

- [Hacer que los enlaces externos de los artículos se abran en una nueva pestaña en Astro](../astro-enlaces-en-nueva-pestana/)

## Referencias

La documentación utilizada como referencia para este artículo es la siguiente:

- [Google Analytics — Configurar Google Analytics](https://support.google.com/analytics/answer/14183469?hl=es)
- [Google Analytics — Instalar el Google tag](https://support.google.com/analytics/answer/9744165?hl=es)
- [Google Analytics — Verificar la recopilación de datos en tiempo real](https://support.google.com/analytics/answer/9271392?hl=es)

---
title: "Setting Up Google Analytics on a Website"
description: "A practical guide to setting up Google Analytics 4 and tracking website traffic."
lang: en
translationKey: google-analytics-sete-configuration
pubDate: 2026-09-21
tags:
  - Google Analytics
  - Web
  - JavaScript
  - Astro
draft: false
---

## Introduction

The main goal when launching a website or application is to attract visitors and build an engaged audience. Data helps us understand whether that goal is being achieved, so we need a way to collect it.

Metrics such as the number of visitors, which pages or screens are viewed most often, where visitors come from, and how they navigate through the content help us understand audience interest and contribute to the evolution of the product.

To track this information, we can use **Google Analytics 4 (GA4)**.

In this article, we will set up Google Analytics on a website, from creating the account to validating data collection.

The example in this article uses a website built with Astro and published on GitHub Pages. However, the Google Analytics setup described here can be used with different technologies and platforms. What mainly changes is how the tag is added to the site's code.

## Creating and Configuring a Google Analytics Account

### Creating the account

The first step is to access Google Analytics: [Google Analytics](https://analytics.google.com/).

Sign in with the Google account that will be used to manage Analytics. If a Google Analytics account does not exist yet, we will need to create one.

### Creating a property

The next step is to create a property. A property represents the set of data we want to analyze in Google Analytics. It is where the data collected by Google Analytics is organized. In this example, this is where we will access the data from our website.

We can name the property after the website. For example:

```text
My New Website
```

### Categorizing the property

During this step, Google Analytics asks for some information that may seem more relevant to businesses, such as the industry and company size.

This step can be confusing when setting up Analytics for a personal website.

Even if we do not have a company, these questions are still part of the Google Analytics setup process.

In my case, since this is a personal website focused on technology, I chose the industry category closest to **Technology/Software**.

For company size, I selected **Small**, since it was the option closest to the reality of a personal website.

We do not need a formal company, CNPJ, or corporate structure to use Google Analytics on a personal website.

### Setting the time zone and currency

During property setup, we also need to define the time zone and currency.

Choose the time zone that corresponds to the region we want to use as the reference for our reports.

For example:

```text
Time zone: (GMT-03:00) São Paulo
Currency: BRL — Brazilian Real
```

The time zone is important because it affects how data is grouped by day in reports.

## Creating a Data Stream

After creating the property, we need to tell Google Analytics where the data will come from.

For a website, we should create a **Web** data stream.

We need to enter the URL of the website we want to monitor. In this article's example:

```text
https://mynewwebsite.com
```

We can also define a name for the stream:

```text
New Website
```

During this setup, keep **Enhanced measurement** enabled.

It allows Google Analytics to automatically collect certain events and information about user navigation without requiring us to implement each event manually.

After creating the stream, Google Analytics will display information about it, including the **Measurement ID**.

The ID looks something like this:

```text
G-XXXXXXXXXX
```

This identifier will be used by the tag installed on the website.

## Installing the Google tag

After creating the Web data stream, Google Analytics provides an option to install the Google tag on the website. Do not close this page or tab, because we will return to it later to validate the installation.

The tag needs to be added to the code of the pages we want to monitor.

Google Analytics provides code similar to this:

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

Replace `G-XXXXXXXXXX` with the Measurement ID generated for your Web data stream. It is best to copy this code directly from Google Analytics rather than from this article. That way, we do not need to worry about replacing the ID manually.

How we add this code depends on the technology used by the website.

If the website uses plain HTML, for example, the tag can be added to the `<head>` of **every** page. Pages that do not include the tag will not send data to Google Analytics.

If the website uses a framework or site generator, there is usually a shared layout, template, or component where we can add the code once. That is what I did in my case. I am using Astro, so I added the tag to the layout shared by the site's pages, ensuring that it is present everywhere. This also means that new pages will include the code automatically.

It is important to make sure this code runs only in production. Otherwise, visits generated during development or in staging environments may also be counted by Google Analytics, affecting the metrics.

In my case, I added a condition that checks whether the current environment is production (**`import.meta.env.PROD`**) before rendering the GA code:

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

## Testing the installation

After publishing the website with the tag, we can use the verification tools provided by Google Analytics.

During the stream setup, there is a **Test installation** button.

Use this option after the new version of the website has been published.

In this article's example, Google returned:

> Google tag detected on your website.

This confirms that Google was able to find the tag on the page.

The **Test installation** button then changed to **Confirm**. When we click it, Google displays information such as:

- stream name;
- stream URL;
- Measurement ID.

We may also see a message indicating that data collection is not active yet. Something like:

> Data collection isn't active on your website. If you installed the tags more than 48 hours ago, verify that they are configured correctly.

This message does not necessarily mean that the installation is incorrect. Data needs to reach Google Analytics before collection can be confirmed. For an immediate check, we can use the **Realtime** report.

## Verifying data collection

For a more complete verification, we can use the **Realtime** report in Google Analytics.

After publishing the website:

1. Open Google Analytics.
2. Go to **Reports → Realtime**.
3. Open the website in another browser tab or window.
4. Browse through a few pages.
5. Wait a few moments.
6. Check whether the activity appears in the report.

In this article's example, the activity appeared correctly in the report, confirming that data collection was working.

The Realtime report is especially useful during the initial setup because it allows us to verify recent activity without waiting for historical reports to be consolidated.

## Changing the domain in the future

It is common for a website to start with an address provided by a hosting platform and later move to a custom domain.

For example, the website used in this article might initially be available at:

```text
https://mynewwebsite.com
```

and later move to:

```text
https://mywebsite.com
```

Changing the domain does not necessarily mean that we need to create a new Google Analytics property. We can continue using the existing property and preserve the data history already collected.

Once the new domain is configured, we can update the URL of the existing Web data stream and continue using the same Measurement ID.

The code installed on the website can also continue using the same ID (`G-XXXXXXXXXX`).

This allows us to keep using the same property and Web data stream while preserving the historical data already collected.

## Conclusion

Setting up Google Analytics on a website is a straightforward process.

First, we create the account and property, configure the Web data stream, and obtain the Measurement ID. Then we add the tag to the website, making sure it runs only in production, and publish the site so the code becomes available to visitors.

Finally, we use Google's verification tools and the Realtime report to confirm that data is being collected.

From that point on, we start to get a clearer view of how the website is being used. As new content is published and traffic grows, this data can help us understand which pages are receiving the most visits and where visitors are coming from.

## Useful links

If you do not have a website yet and want to build one with Astro, you may also want to read:

- [Building an Astro website and publishing it on GitHub Pages with GitHub Actions](../construindo-site-astro-github-pages/)

If you use Astro and, like me, want external links on your site to open in a new tab, see how I implemented it in:

- [Making external links in Astro posts open in a new tab](../astro-links-em-nova-aba/)

## References

The documentation used as references for this article is:

- [Google Analytics — Set up Google Analytics](https://support.google.com/analytics/answer/14183469?hl=en)
- [Google Analytics — Install the Google tag](https://support.google.com/analytics/answer/9744165?hl=en)
- [Google Analytics — Verify data collection in real time](https://support.google.com/analytics/answer/9271392?hl=en)

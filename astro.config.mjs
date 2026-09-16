// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { externalLinks } from './src/plugins/external-links';

// https://astro.build/config
export default defineConfig({
	site: 'https://dougcosta.github.io',
	integrations: [mdx(), sitemap()],
	markdown: {
		processor: satteri({
			hastPlugins: [externalLinks],
		}),
	},
});

export const SITE = {
	url: 'https://dougcosta.com',
	title: 'Doug Costa',
	tagline: 'Leadership, Software Engineering, Technology & Learning',
	description:
		'Meu espaço pessoal para escrever sobre engenharia de software, arquitetura, tecnologia, IA, liderança e aprendizado contínuo.',
	lang: 'pt-BR',
	locale: 'pt_BR',
} as const;

export const AUTHOR = {
	name: 'Doug Costa',
	url: 'https://dougcosta.com',
} as const;

export const NAV = [
	{ label: 'Início', href: '/' },
	{ label: 'Blog', href: '/blog/' },
	{ label: 'Sobre', href: '/about/' },
] as const;

export const SOCIAL = [
	{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/douglascosta' },
	{ label: 'GitHub', href: 'https://github.com/dougcosta' },
] as const;

export const BLOG = {
	postsPerPage: 8,
	postsOnHome: 4,
	wordsPerMinute: 220,
	showReadingTime: true,
	showTableOfContents: true,
	tocMinHeadings: 3,
} as const;

// Backwards-compatible exports while the site moves from the Astro starter.
export const SITE_TITLE = SITE.title;
export const SITE_DESCRIPTION = SITE.description;

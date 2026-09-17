import type { Locale } from './index';

const supportedLocales: Locale[] = ['pt-BR', 'en', 'fr', 'es'];

export function getLocaleFromUrl(url: URL): Locale {
	const [, firstSegment] = url.pathname.split('/');

	if (firstSegment && supportedLocales.includes(firstSegment as Locale)) {
		return firstSegment as Locale;
	}

	return 'pt-BR';
}

export function getLocalePrefix(locale: Locale): string {
	return locale === 'pt-BR' ? '' : `/${locale}`;
}

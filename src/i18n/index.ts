import ptBR from './pt-BR';
import en from './en';
import fr from './fr';
import es from './es';

const translations = {
	'pt-BR': ptBR,
	en,
	fr,
	es,
};

export type Locale = keyof typeof translations;

export type Translations = typeof ptBR;

const typedTranslations: Record<Locale, Translations> = {
	'pt-BR': ptBR,
	en,
	fr,
	es,
};

export function getTranslations(locale: Locale): Translations {
	return typedTranslations[locale];
}
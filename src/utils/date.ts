import { SITE } from '../consts';

export const formatDate = (date: Date) => new Intl.DateTimeFormat(SITE.lang, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
export const isoDate = (date: Date) => date.toISOString();

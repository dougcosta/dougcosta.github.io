import { BLOG } from '../consts';

export const readingTime = (body: string | undefined) => {
	const words = (body ?? '').replace(/```[\s\S]*?```|`[^`]*`/g, ' ').trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / BLOG.wordsPerMinute));
};

import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

export function tagSlug(tag: string) {
	return tag.trim().toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, '-').replace(/^-|-$/g, '');
}

export async function getPublishedPosts(): Promise<Post[]> {
	const posts = await getCollection('blog', ({ data }) => !import.meta.env.PROD || !data.draft);
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function collectTags(posts: Post[]) {
	const tags = new Map<string, { name: string; slug: string; count: number }>();
	for (const post of posts) for (const name of post.data.tags) {
		const slug = tagSlug(name);
		if (!slug) continue;
		const entry = tags.get(slug);
		entry ? entry.count++ : tags.set(slug, { name, slug, count: 1 });
	}
	return [...tags.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export const postsByTag = (posts: Post[], slug: string) => posts.filter((post) => post.data.tags.some((tag) => tagSlug(tag) === slug));

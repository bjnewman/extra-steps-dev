import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const terms = await getCollection('terms', ({ data }) => !data.draft);

  // Sort by publishedAt descending
  const sorted = terms.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );

  return rss({
    title: 'extra-steps.dev — new terms',
    description: 'AI marketing hype mapped to CS primitives. New terms as they are added.',
    site: context.site!,
    items: sorted.map((term) => ({
      title: `${term.data.title} = ${term.data.primitives.join(' + ')} with extra steps`,
      description: term.data.tagline,
      link: `/terms/${term.id}/`,
      pubDate: term.data.publishedAt,
    })),
    customData: `<language>en-us</language>`,
  });
}

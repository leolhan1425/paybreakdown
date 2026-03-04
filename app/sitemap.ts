import { MetadataRoute } from 'next';
import { getAllSlugs, getAllStateSlugs } from '@/lib/slug-generator';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://paybreakdown.com';

  const pages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
  ];

  for (const stateSlug of getAllStateSlugs()) {
    pages.push({
      url: `${baseUrl}/${stateSlug}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.8,
    });
  }

  for (const slug of getAllSlugs()) {
    pages.push({
      url: `${baseUrl}/salary/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    });
  }

  return pages;
}

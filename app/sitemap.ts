import { MetadataRoute } from 'next';
import { getAllSlugs, getAllStateSlugs } from '@/lib/slug-generator';
import { getAllBlogSlugs } from '@/lib/blog';
import { getAllComparisonSlugs } from '@/lib/compare';
import { getAllRelocationSlugs } from '@/lib/relocation-slugs';
import { getAllFreelanceSlugs } from '@/lib/freelance-slugs';
import { getAllAffordSlugs } from '@/lib/afford-slugs';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://salaryhog.com';

  const pages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  for (const slug of getAllBlogSlugs()) {
    pages.push({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  for (const slug of getAllComparisonSlugs()) {
    pages.push({
      url: `${baseUrl}/compare/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.7,
    });
  }

  pages.push({
    url: `${baseUrl}/relocate`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  });

  for (const slug of getAllRelocationSlugs()) {
    pages.push({
      url: `${baseUrl}/relocate/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    });
  }

  pages.push({
    url: `${baseUrl}/afford`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  });

  for (const slug of getAllAffordSlugs()) {
    pages.push({
      url: `${baseUrl}/afford/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    });
  }

  pages.push({
    url: `${baseUrl}/freelance`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  });

  for (const slug of getAllFreelanceSlugs()) {
    pages.push({
      url: `${baseUrl}/freelance/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    });
  }

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

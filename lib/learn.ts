import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const LEARN_DIR = path.join(process.cwd(), 'content/learn');

export interface LearnPage {
  slug: string;
  title: string;
  description: string;
  category: string;
  html: string;
  readingTime: number;
  relatedSlugs: string[];
  faq: { question: string; answer: string }[];
}

export function getAllLearnPages(): LearnPage[] {
  const files = fs.readdirSync(LEARN_DIR).filter(f => f.endsWith('.md'));
  return files
    .map(file => getLearnPageBySlug(file.replace(/\.md$/, '')))
    .filter((p): p is LearnPage => p !== null)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getLearnPageBySlug(slug: string): LearnPage | null {
  const filePath = path.join(LEARN_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const html = marked(content) as string;
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 250));

  return {
    slug: data.slug || slug,
    title: data.title || slug,
    description: data.description || '',
    category: data.category || 'General',
    html,
    readingTime,
    relatedSlugs: data.related || [],
    faq: data.faq || [],
  };
}

export function getAllLearnSlugs(): string[] {
  const files = fs.readdirSync(LEARN_DIR).filter(f => f.endsWith('.md'));
  return files.map(f => f.replace(/\.md$/, ''));
}

export function getLearnPagesByCategory(): Record<string, LearnPage[]> {
  const pages = getAllLearnPages();
  const categories: Record<string, LearnPage[]> = {};
  for (const page of pages) {
    if (!categories[page.category]) categories[page.category] = [];
    categories[page.category].push(page);
  }
  return categories;
}

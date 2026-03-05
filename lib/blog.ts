import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  html: string;
  readingTime: number;
}

export function getAllPosts(): BlogPost[] {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  return files
    .map(file => getPostBySlug(file.replace(/\.md$/, '')))
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const html = marked(content) as string;
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 250));

  return {
    slug: data.slug || slug,
    title: data.title || slug,
    excerpt: data.excerpt || '',
    date: data.date || '',
    html,
    readingTime,
  };
}

export function getAllBlogSlugs(): string[] {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  return files.map(f => f.replace(/\.md$/, ''));
}

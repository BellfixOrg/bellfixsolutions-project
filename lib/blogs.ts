import fs from 'fs';
import path from 'path';
import { BlogPost } from '@/types';
import { getAdminClient } from './supabase/admin';
import { getBlogSlug } from './site';

const BLOGS_FILE = path.join(process.cwd(), 'data', 'blogs.json');

export { getBlogSlug };

export async function getBlogPostBySlug(slug: string, onlyActive = true): Promise<BlogPost | null> {
  const blogs = await getBlogPosts(onlyActive);
  const normalizedSlug = slug.toLowerCase().trim();
  const found = blogs.find((b) => {
    const postSlug = getBlogSlug(b).toLowerCase();
    return postSlug === normalizedSlug || b.id.toLowerCase() === normalizedSlug;
  });
  return found || null;
}

export function readLocalBlogs(): BlogPost[] {
  try {
    if (fs.existsSync(BLOGS_FILE)) {
      const content = fs.readFileSync(BLOGS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading local blogs:', err);
  }
  return [];
}

export function writeLocalBlogs(blogs: BlogPost[]): void {
  try {
    const dir = path.dirname(BLOGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local blogs:', err);
  }
}

export async function getBlogPosts(onlyActive = true): Promise<BlogPost[]> {
  try {
    const client = getAdminClient();
    if (client) {
      let query = client.from('blog_posts').select('*').order('display_order', { ascending: true });
      if (onlyActive) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data as BlogPost[];
      }
    }
  } catch (err) {
    console.warn('Supabase getBlogPosts error, using local fallback:', err);
  }

  const localList = readLocalBlogs();
  return onlyActive ? localList.filter((b) => b.is_active) : localList;
}

export async function saveBlogPost(
  post: Partial<BlogPost> & { title: string; category: string; excerpt: string; content: string }
): Promise<BlogPost> {
  const client = getAdminClient();
  const now = new Date().toISOString();
  let savedPost: BlogPost | null = null;

  try {
    if (client) {
      if (post.id && !post.id.startsWith('blog-')) {
        const { data, error } = await client
          .from('blog_posts')
          .update({
            title: post.title,
            category: post.category,
            read_time: post.read_time || '3 min read',
            excerpt: post.excerpt,
            content: post.content,
            date: post.date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            image_url: post.image_url || '',
            display_order: post.display_order ?? 1,
            is_active: post.is_active ?? true,
            updated_at: now,
          })
          .eq('id', post.id)
          .select()
          .maybeSingle();

        if (!error && data) savedPost = data as BlogPost;
      } else {
        const { data, error } = await client
          .from('blog_posts')
          .insert({
            title: post.title,
            category: post.category,
            read_time: post.read_time || '3 min read',
            excerpt: post.excerpt,
            content: post.content,
            date: post.date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            image_url: post.image_url || '',
            display_order: post.display_order ?? 1,
            is_active: post.is_active ?? true,
            created_at: now,
            updated_at: now,
          })
          .select()
          .maybeSingle();

        if (!error && data) savedPost = data as BlogPost;
      }
    }
  } catch (err) {
    console.warn('Supabase saveBlogPost error, using local storage:', err);
  }

  // Update local file
  const localList = readLocalBlogs();
  if (post.id) {
    const idx = localList.findIndex((b) => b.id === post.id);
    if (idx !== -1) {
      savedPost = {
        ...localList[idx],
        ...post,
        updated_at: now,
      } as BlogPost;
      localList[idx] = savedPost;
    }
  }

  if (!savedPost) {
    savedPost = {
      id: post.id || `blog-${Date.now()}`,
      title: post.title,
      category: post.category,
      read_time: post.read_time || '3 min read',
      excerpt: post.excerpt,
      content: post.content,
      date: post.date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      image_url: post.image_url || '',
      display_order: post.display_order ?? localList.length + 1,
      is_active: post.is_active ?? true,
      created_at: now,
      updated_at: now,
    };
    localList.push(savedPost);
  }

  writeLocalBlogs(localList);
  return savedPost;
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  try {
    const client = getAdminClient();
    if (client && !id.startsWith('blog-')) {
      await client.from('blog_posts').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('Supabase deleteBlogPost error, proceeding with local delete:', err);
  }

  const localList = readLocalBlogs();
  const filtered = localList.filter((b) => b.id !== id);
  writeLocalBlogs(filtered);
  return true;
}


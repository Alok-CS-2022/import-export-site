import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const contentSchema = z.object({
  hero_title: z.string().min(1, { message: "Hero title required" }).max(200),
  hero_subtitle: z.string().min(1).max(500),
  hero_cta_text: z.string().min(1).max(50),
  hero_cta_link: z.string().url(),
  testimonials: z.array(z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    content: z.string().min(1),
    rating: z.number().min(1).max(5),
  })).min(0).max(20),
  social_links: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
  }),
  seo_title: z.string().min(1).max(60),
  seo_description: z.string().min(1).max(160),
  seo_keywords: z.string().max(500),
});

const ALLOWED_ORIGINS = [
  'https://importfromnepal.com',
  'https://www.importfromnepal.com',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  'http://localhost:3000',
  'http://localhost:8080'
].filter(Boolean);

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Missing auth header' });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (user.user_metadata?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden', message: 'Admin access required' });
    }

    // Store for audit trail - though we are not using it in this snippet
    const adminEmail = user.email;

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Error fetching site content:', error);
        return res.status(500).json({ error: 'Error fetching content', message: error.message });
      }

      return res.status(200).json({ success: true, data });
    }

    if (req.method === 'PUT') {
      let validatedData;
      try {
        validatedData = contentSchema.parse(req.body);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = error.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
          return res.status(400).json({ error: 'Validation failed', errors });
        }
        // Re-throw if it's not a Zod error
        throw error;
      }

      // Clean social links: convert empty strings to null for the database
      for (const key in validatedData.social_links) {
        if (validatedData.social_links[key] === '') {
          validatedData.social_links[key] = null;
        }
      }

      const dataToUpdate = {
        ...validatedData,
        updated_at: new Date().toISOString(),
        updated_by: adminEmail,
      };

      const { data, error } = await supabase
        .from('site_content')
        .update(dataToUpdate)
        .eq('id', 1)
        .select()
        .single();

      if (error) {
        console.error('Error updating site content:', error);
        return res.status(500).json({ error: 'Error updating content', message: error.message });
      }

      return res.status(200).json({ success: true, message: 'Content updated successfully', data });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'OPTIONS']);
    return res.status(405).json({ error: 'Method not allowed', message: `Method ${req.method} is not supported. Use GET or PUT.` });


  } catch (e) {
    console.error('Unexpected error in /api/admin/content:', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

import { supabase } from '../../lib/supabase.js';
import { z } from 'zod';

// Content Validation Schema
const contentSchema = z.object({
  hero_title: z.string().optional(),
  hero_subtitle: z.string().optional(),
  hero_cta_text: z.string().optional(),
  hero_cta_link: z.string().optional(),
  testimonials: z.array(
    z.object({
      name: z.string().optional(),
      role: z.string().optional(),
      content: z.string().optional(),
      rating: z.number().optional()
    })
  ).optional(),
  social_links: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional()
  }).optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.string().optional()
});

export default async function handler(req, res) {
  // Enable CORS
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://importfromnepal.com',
    'https://www.importfromnepal.com',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    'http://localhost:3000'
  ].filter(Boolean);

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // auth checks removed

  // 2. HANDLE DIFFERENT OPERATIONS

  // 2. HANDLE DIFFERENT OPERATIONS
  try {
    switch (req.method) {
      case 'GET':
        // Fetch content
        const { data: content, error: getError } = await supabase
          .from('site_content')
          .select('*')
          .single();

        if (getError) {
          // If no content exists yet, return default structure
          if (getError.code === 'PGRST116') {
            return res.status(200).json({
              data: {
                hero_title: '',
                hero_subtitle: '',
                hero_cta_text: '',
                hero_cta_link: '',
                testimonials: [],
                social_links: {
                  facebook: '',
                  twitter: '',
                  instagram: '',
                  linkedin: ''
                },
                seo_title: '',
                seo_description: '',
                seo_keywords: ''
              }
            });
          }
          throw getError;
        }

        return res.status(200).json({ data: content });

      case 'PUT':
        // VALIDATE INPUT
        const resultPut = contentSchema.safeParse(req.body);
        if (!resultPut.success) {
          return res.status(400).json({
            error: 'Validation failed',
            details: resultPut.error.errors[0].message
          });
        }

        // Prepare update with metadata
        const updateData = {
          ...resultPut.data,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        };

        // Upsert content (insert if doesn't exist, update if it does)
        const { data: savedContent, error: putError } = await supabase
          .from('site_content')
          .upsert(updateData, { onConflict: 'id' })
          .select()
          .single();

        if (putError) throw putError;

        return res.status(200).json({
          data: savedContent,
          message: 'Content saved successfully'
        });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Database error:', error);
    return res.status(500).json({ error: error.message });
  }
}
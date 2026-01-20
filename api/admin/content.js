import { supabase } from '../lib/supabase.js';
import { z } from 'zod';

// Content Validation Schema
const contentSchema = z.object({
  content: z.record(z.any()).optional()
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        // Fetch main content
        const { data: content, error: getError } = await supabase
          .from('site_content')
          .select('*')
          .single();

        let contentData = {};
        if (getError) {
          if (getError.code === 'PGRST116') {
            contentData = { content: {} };
          } else {
            throw getError;
          }
        } else {
          contentData = content;
        }

        // Fetch slider items
        const { data: sliderItems, error: sliderError } = await supabase
          .from('slider_items')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (!sliderError && sliderItems) {
          contentData.slider = sliderItems;
        }

        // Fetch blog stories
        const { data: blogStories, error: blogError } = await supabase
          .from('blog_stories')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (!blogError && blogStories) {
          contentData.blog = blogStories;
        }

        return res.status(200).json({ data: contentData });

      case 'PUT':
        // VALIDATE INPUT
        // Expecting { content: { ... } }
        const resultPut = contentSchema.safeParse(req.body);
        if (!resultPut.success) {
          return res.status(400).json({
            error: 'Validation failed',
            details: resultPut.error.errors[0].message
          });
        }

        // Prepare update
        const updateData = {
          content: resultPut.data.content || {},
          updated_at: new Date().toISOString()
        };

        // Upsert content
        // We assume there's only one row for site content, or we use a fixed ID if needed.
        // For simplicity, let's assume we are updating the row with id=1 if it exists, or letting Supabase handle it if we don't assume ID.
        // Actually, best practice for singleton config is often just updating the single row.
        // But since we don't know the ID, we might need to fetch it first or assume a fixed one.
        // Let's rely on the fact that we probably want to update the row that exists.

        // Strategy: Check if row exists, if so update it. If not, insert.
        const { data: existing } = await supabase.from('site_content').select('id').limit(1).single();

        let query = supabase.from('site_content');
        if (existing) {
          query = query.update(updateData).eq('id', existing.id);
        } else {
          query = query.insert([updateData]);
        }

        const { data: savedContent, error: putError } = await query.select().single();

        if (putError) throw putError;

        return res.status(200).json({
          data: savedContent,
          message: 'Content saved successfully'
        });

      case 'POST':
        // Simple save/update for content data
        try {
          const contentData = req.body;

          // Check if content record exists
          const { data: existing } = await supabase
            .from('site_content')
            .select('id')
            .limit(1)
            .single();

          let result;
          if (existing) {
            // Update existing
            result = await supabase
              .from('site_content')
              .update({
                content: contentData,
                updated_at: new Date().toISOString()
              })
              .eq('id', existing.id)
              .select()
              .single();
          } else {
            // Insert new
            result = await supabase
              .from('site_content')
              .insert([{
                content: contentData,
                updated_at: new Date().toISOString()
              }])
              .select()
              .single();
          }

          if (result.error) throw result.error;

          // Also save slider items if provided
          if (contentData.slider && Array.isArray(contentData.slider)) {
            // First deactivate all existing
            await supabase.from('slider_items').update({ is_active: false });

            // Then insert/update new ones
            for (const item of contentData.slider) {
              await supabase
                .from('slider_items')
                .upsert({
                  title: item.title,
                  description: item.description,
                  image_url: item.imageUrl || item.image_url,
                  button_text: item.buttonText || item.button_text,
                  button_link: item.buttonLink || item.button_link,
                  accent_pill: item.accentPill || item.accent_pill,
                  display_order: item.display_order || 0,
                  is_active: true
                }, { onConflict: 'title' });
            }
          }

          // Also save blog stories if provided
          if (contentData.blogStories && Array.isArray(contentData.blogStories)) {
            // First deactivate all existing
            await supabase.from('blog_stories').update({ is_active: false });

            // Then insert/update new ones
            for (const story of contentData.blogStories) {
              await supabase
                .from('blog_stories')
                .upsert({
                  title: story.title,
                  description: story.description,
                  image_url: story.imageUrl || story.image_url,
                  category: story.category,
                  is_featured: story.isFeatured || story.is_featured || false,
                  display_order: story.display_order || 0,
                  is_active: true
                }, { onConflict: 'title' });
            }
          }

          return res.status(200).json({
            message: 'Content saved successfully',
            data: result.data
          });

        } catch (postError) {
          console.error('POST save error:', postError);
          return res.status(500).json({ error: 'Failed to save content' });
        }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Database error:', error);
    return res.status(500).json({ error: error.message });
  }
}
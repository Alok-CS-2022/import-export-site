import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://tpvqolkzcbbzlqlzchwc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwdnFvbGt6Y2JiemxxbHpjaHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNjA0MjgsImV4cCI6MjA4MTkzNjQyOH0.AU6ieHN1TSUHgSu7qfvkekvmMySDPJb2zOId4Oy7CeY';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (error) {
      return res.status(200).json({ 
        status: 'supabase_error',
        message: error.message,
        code: error.code,
        details: error.details
      });
    }

    return res.status(200).json({ 
      status: 'success',
      message: 'Supabase connection working',
      data_count: data ? data.length : 0,
      sample_data: data
    });
  } catch (err) {
    return res.status(200).json({ 
      status: 'error',
      message: err.message,
      stack: err.stack
    });
  }
}

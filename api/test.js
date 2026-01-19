import { supabase } from './lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Test 1: Check if Supabase client is imported correctly
    const test1 = { 
      imported: !!supabase, 
      hasUrl: !!supabase.supabaseUrl,
      hasKey: !!supabase.supabaseKey 
    };

    // Test 2: Try a simple query
    const { data, error } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);

    const test2 = { 
      success: !error, 
      error_message: error?.message,
      error_code: error?.code,
      data_count: data?.length 
    };

    return res.status(200).json({
      status: 'diagnostic_results',
      test1_supabase_import: test1,
      test2_database_query: test2,
      all_env_vars: Object.keys(process.env).filter(k => k.includes('SUPABASE')),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(200).json({ 
      status: 'error',
      error_message: err.message,
      error_stack: err.stack
    });
  }
}

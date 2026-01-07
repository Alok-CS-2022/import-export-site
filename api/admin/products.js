import { supabase } from '../../lib/supabase.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. VERIFY ADMIN SESSION
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.replace('Bearer ', '');
  
  // Verify the token with Supabase
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  // At this point, user is authenticated
  console.log('✅ Authenticated admin:', user.email);

  // 2. HANDLE DIFFERENT OPERATIONS
  try {
    switch (req.method) {
      case 'GET':
        // Fetch all products
        const { data: products, error: getError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (getError) throw getError;
        return res.status(200).json(products);

      case 'POST':
        // Create new product
        const { data: newProduct, error: postError } = await supabase
          .from('products')
          .insert([req.body])
          .select()
          .single();
        
        if (postError) throw postError;
        return res.status(201).json(newProduct);

      case 'PUT':
        // Update existing product
        const { id, ...updateData } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'Product ID required' });
        }

        const { data: updatedProduct, error: putError } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (putError) throw putError;
        return res.status(200).json(updatedProduct);

      case 'DELETE':
        // Delete product
        const productId = req.query.id;
        
        if (!productId) {
          return res.status(400).json({ error: 'Product ID required' });
        }

        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);
        
        if (deleteError) throw deleteError;
        return res.status(200).json({ success: true, message: 'Product deleted' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Database error:', error);
    return res.status(500).json({ error: error.message });
  }
}
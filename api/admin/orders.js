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

    // Verify with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // 2. HANDLE ORDERS
    try {
        switch (req.method) {
            case 'GET':
                const { data: orders, error: getError } = await supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (getError) throw getError;
                return res.status(200).json(orders);

            case 'PUT':
                // Update order status
                const { id, status } = req.body;
                if (!id || !status) return res.status(400).json({ error: 'Missing id or status' });

                const { data: updated, error: putError } = await supabase
                    .from('orders')
                    .update({ status })
                    .eq('id', id)
                    .select()
                    .single();

                if (putError) throw putError;
                return res.status(200).json(updated);

            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: err.message });
    }
}

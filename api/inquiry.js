import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
    // Enable CORS for preflight requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');

    if (req.method === 'OPTIONS') {
        // Respond to preflight requests
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const inquiry = req.body;

        const { error } = await supabase.from('orders').insert([inquiry]);

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ error: error.message });
        }

        // Optionally, re-send email notification from here if desired
        // For now, we'll assume the client will handle it, or you can
        // move the web3forms fetch here.

        res.status(200).json({ message: 'Inquiry submitted successfully' });

    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
}

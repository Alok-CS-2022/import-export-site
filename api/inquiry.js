import { supabase } from '../lib/supabase.js';
import { z } from 'zod';

// Define Validation Schema
const inquirySchema = z.object({
    customer_name: z.string().min(1, "Name is required"),
    customer_email: z.string().email("Invalid email address"),
    customer_phone: z.string().optional().nullable(),
    product_name: z.string().min(1, "Product name is required"),
    message: z.string().min(1, "Message is required").max(1000),
    items: z.string().optional().nullable(), // JSON string
    total_amount: z.number().optional().default(0),
    status: z.string().optional().default('pending')
});

export default async function handler(req, res) {
    // Enable CORS for preflight requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // 1. AUTHENTICATE USER (REQUIRED)
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'You must be logged in to submit an inquiry.' });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid session. Please login again.' });
        }

        // 2. VALIDATE INPUT
        const validationResult = inquirySchema.safeParse(req.body);

        if (!validationResult.success) {
            const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
            return res.status(400).json({ error: errorMessage });
        }

        // 3. PREPARE DATA WITH USER ID
        const inquiry = {
            ...validationResult.data,
            user_id: user.id
        };

        // 4. INSERT INTO DB
        const { error } = await supabase.from('orders').insert([inquiry]);

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ message: 'Inquiry submitted successfully' });

    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
}

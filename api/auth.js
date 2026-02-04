import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  console.log('AUTH handler called:', req.method, req.url);
  console.log('Request body:', req.body);
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request received');
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { type, email, password, phone, user_metadata } = req.body || {};
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const adminEmails = [
      'alok.kharel.nepal@gmail.com',
      'sujanadhikari1111@gmail.com'
    ];
    
    try {
      if (type === 'signup') {
        // Check if admin email
        if (adminEmails.includes(email)) {
          console.log('Admin email attempted signup:', email);
          return res.status(400).json({ error: 'This email is reserved for admin login only.' });
        }
        
        console.log('Processing signup for:', email);
        
        // Create user in Supabase Auth
        const signupOptions = user_metadata ? { data: user_metadata } : undefined;
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password, 
          options: signupOptions 
        });
        
        if (error) {
          console.log('Signup error:', error.message);
          throw error;
        }
        
        console.log('Signup success:', data);
        
        // If user was created successfully, store additional data in user_profile table
        if (data.user) {
          try {
            // Wait a moment for the user to be fully created in auth.users table
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert([
                {
                  id: data.user.id,
                  email: email,
                  password: password,
                  phone: phone || null,
                  full_name: user_metadata?.full_name || null
                }
              ]);
            
            if (insertError) {
              console.log('Error inserting to user_profiles table:', insertError.message);
              // Don't fail the signup, just log the error
            } else {
              console.log('Successfully inserted user data to user_profiles table');
            }
          } catch (insertErr) {
            console.log('Exception inserting to user_profiles table:', insertErr.message);
            // Don't fail the signup, just log the error
          }
        }
        
        return res.status(200).json({ 
          success: true, 
          user: data.user, 
          session: data.session 
        });
        
      } else if (type === 'login') {
        // Check if admin email
        if (adminEmails.includes(email)) {
          console.log('Admin email attempted user login:', email);
          return res.status(400).json({ error: 'Please use the admin login page for this email.' });
        }
        
        console.log('Processing login for:', email);
        
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        
        if (error) {
          console.log('Login error:', error.message);
          
          // Handle email not confirmed error
          const errorMessage = error?.message || '';
          if (errorMessage.includes('Email not confirmed') || errorMessage.includes('email not confirmed')) {
            return res.status(400).json({ 
              error: 'Email not confirmed. Please check your email for confirmation link.',
              message: 'Note: In production, users must confirm their email before logging in.'
            });
          }
          
          throw error;
        }
        
        console.log('Login success');
        return res.status(200).json({ 
          success: true, 
          user: data.user, 
          session: data.session 
        });
        
      } else {
        console.log('Invalid type:', type);
        return res.status(400).json({ error: 'Invalid request type. Use "signup" or "login".' });
      }
      
    } catch (err) {
      console.log('Catch error:', err.message);
      return res.status(400).json({ error: err.message });
    }
  }

  console.log('Method not allowed:', req.method);
  return res.status(405).json({ error: 'Method not allowed' });
}
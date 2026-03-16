// DEPLOYMENT READY: Uncomment to activate
// This service handles all Supabase authentication logic including email/password and OAuth.

/*
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const authService = {
  // Email/Password Signup
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Email/Password Login
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Google OAuth Login
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: import.meta.env.VITE_SITE_URL,
      },
    });
    return { data, error };
  },

  // Forgot Password / Password Reset
  async forgotPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_SITE_URL}/reset-password`,
    });
    return { data, error };
  },

  // Auth State Listener
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery mode activated');
      }
      callback(event, session);
    });
  },

  // Sign Out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }
};
*/


import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUsernameAvailability = async (username: string) => {
    try {
      const { data, error } = await supabase.rpc('is_username_available', {
        username_to_check: username
      });
      
      if (error) {
        console.error('Error checking username:', error);
        return false;
      }
      
      return data;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  const canChangeUsername = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('can_change_username', {
        user_id: userId
      });
      
      if (error) {
        console.error('Error checking username change availability:', error);
        return false;
      }
      
      return data;
    } catch (error) {
      console.error('Error checking username change availability:', error);
      return false;
    }
  };

  const updateUsername = async (userId: string, newUsername: string) => {
    try {
      const { data, error } = await supabase.rpc('update_username', {
        user_id: userId,
        new_username: newUsername
      });
      
      if (error) {
        console.error('Error updating username:', error);
        return { success: false, error: error.message };
      }
      
      return { success: data, error: null };
    } catch (error) {
      console.error('Error updating username:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  const updatePassword = async (newPassword: string, accessToken: string, refreshToken: string) => {
    try {
      // Set the session with the tokens from the reset link
      const { data: { session }, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        return { data: null, error: sessionError };
      }

      // Update the password
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      return { data, error };
    } catch (error) {
      console.error('Error updating password:', error);
      return { data: null, error: { message: 'An unexpected error occurred' } };
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    checkUsernameAvailability,
    canChangeUsername,
    updateUsername,
  };
};

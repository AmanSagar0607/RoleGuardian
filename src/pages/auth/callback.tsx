import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        navigate('/dashboard');
      } else if (event === 'USER_UPDATED') {
        navigate('/login');
      } else {
        navigate('/login');
      }
    });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Verifying your email...</h2>
        <p>Please wait while we confirm your email address.</p>
      </div>
    </div>
  );
}
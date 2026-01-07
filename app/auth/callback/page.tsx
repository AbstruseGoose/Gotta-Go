'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          router.push('/?error=auth_failed');
          return;
        }

        if (data.session) {
          router.push('/');
        } else {
          router.push('/?error=no_session');
        }
      } catch (error) {
        console.error('Callback error:', error);
        router.push('/?error=callback_failed');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🔐</div>
        <p className="text-xl font-semibold">Signing you in...</p>
        <p className="text-gray-400 mt-2">Please wait</p>
      </div>
    </div>
  );
}

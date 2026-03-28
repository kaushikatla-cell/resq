'use client';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const supabase = createClient();
  const router   = useRouter();
  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }
  return (
    <button onClick={signOut} className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-300 transition-colors">
      Sign out
    </button>
  );
}

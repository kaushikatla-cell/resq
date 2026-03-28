import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogoutButton } from '@/components/LogoutButton';

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/impact',    label: 'Impact'    },
  { href: '/admin',     label: 'Admin'     },
  { href: '/about',     label: 'About'     },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-green-500 rounded-md flex items-center justify-center text-white font-semibold text-xs">R</div>
              <span className="font-semibold text-sm text-gray-900">ResQ</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              {NAV.map(l => (
                <Link key={l.href} href={l.href} className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400 hidden sm:block">Live</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode]         = useState<'signin'|'signup'>('signin');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [sent, setSent]         = useState(false);
  const router   = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    if (mode === 'signin') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      router.push('/dashboard'); router.refresh();
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      setSent(true); setLoading(false);
    }
  }

  if (sent) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-sm w-full text-center">
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-green-600 text-xl">✓</span>
        </div>
        <h2 className="text-lg font-semibold mb-2">Check your email</h2>
        <p className="text-sm text-gray-500">Confirmation sent to <strong>{email}</strong>.</p>
        <button onClick={() => { setSent(false); setMode('signin'); }} className="mt-6 text-sm text-gray-500 underline">Back to sign in</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-sm w-full">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-green-500 rounded-md flex items-center justify-center text-white font-semibold text-xs">R</div>
          <span className="font-semibold text-gray-900">ResQ</span>
        </Link>
        <h1 className="text-xl font-semibold mb-1">{mode === 'signin' ? 'Welcome back' : 'Create account'}</h1>
        <p className="text-sm text-gray-500 mb-6">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-green-600 font-medium hover:underline">
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@mit.edu" className="input" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input" />
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors mt-1">
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">Demo: use any email + password to sign up</p>
        </div>
      </div>
    </div>
  );
}

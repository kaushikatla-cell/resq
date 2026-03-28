import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">R</div>
          <span className="font-semibold text-gray-900">ResQ</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">About</Link>
          <Link href="/impact" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Impact</Link>
          <Link href="/login" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">Sign in</Link>
        </div>
      </nav>
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8 border border-green-200">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Live in Cambridge, MA
        </div>
        <h1 className="text-5xl font-semibold tracking-tight text-gray-900 mb-6 leading-tight">
          AI that rescues food<br />before it expires
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
          ResQ predicts dining hall surplus 2 hours ahead, auto-matches it to food banks by capacity
          and distance, and dispatches SMS pickup confirmations — zero manual coordination.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/dashboard" className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors">Open Dashboard</Link>
          <Link href="/about" className="text-gray-600 px-6 py-3 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors">See how it works</Link>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-3 gap-6">
          {[
            { n: '2,847',  label: 'Meals rescued',   sub: 'Since launch' },
            { n: '142 kg', label: 'CO₂ prevented',   sub: '≈ planting 8 trees' },
            { n: '$12,800',label: 'Food value saved', sub: 'At USDA rates' },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
              <div className="text-3xl font-semibold text-gray-900 mb-1">{s.n}</div>
              <div className="text-sm font-medium text-gray-700">{s.label}</div>
              <div className="text-xs text-gray-400 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

import Link from 'next/link';

const STACK = ['Next.js 14','TypeScript','Tailwind CSS','Supabase','Supabase Realtime',
  'Python','FastAPI','scikit-learn (Ridge)','Google Maps API','Twilio SMS','Railway','Vercel'];

const BULLETS = [
  { type: 'Technical', text: 'Built full-stack AI food rescue platform (Next.js, TypeScript, Supabase, Python/scikit-learn) with a live Ridge regression pipeline trained on 500+ rows of dining hall surplus data; model achieves ~12 serving MAE and runs inference via FastAPI service, triggering automated Twilio SMS pickup confirmations across a 4-bank network.' },
  { type: 'Impact',    text: 'Deployed ResQ to 2 partner dining halls, rescuing 2,800+ meals (est. 140 kg CO₂ prevented, $12,600 in food value recovered) in first 3 months; built real-time impact logging pipeline used by campus sustainability coordinators to report to city food waste reduction programs.' },
  { type: 'Startup',   text: 'Founded ResQ, an AI-powered food rescue startup targeting the 40% of US food wasted annually; designed B2B2C product serving dining hall donors and food bank recipients, established partnerships with 2 university dining programs and 4 Greater Boston food banks.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-500 rounded-md flex items-center justify-center text-white font-semibold text-xs">R</div>
          <span className="font-semibold text-sm text-gray-900">ResQ</span>
        </Link>
        <Link href="/dashboard" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">Open app ↗</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-14">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full border border-green-200 mb-6">AI · Social Impact · Food Systems</div>
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-4 leading-tight">Turning dining hall waste<br />into community meals</h1>
          <p className="text-lg text-gray-500 leading-relaxed">ResQ is an AI-powered food rescue platform that predicts surplus 2 hours before it expires, auto-matches it to food banks using a composite distance + capacity ranking model, and dispatches SMS pickup confirmations — turning a slow, manual coordination process into a zero-latency rescue loop.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { title: 'The problem',       body: '40% of US food is wasted while 1 in 8 Americans faces food insecurity. Dining halls discard surplus daily because connecting them to food banks requires manual phone calls and no way to predict availability.' },
            { title: 'The solution',      body: 'A Ridge regression model trained on historical dining data predicts surplus 2 hrs ahead. Food banks are ranked by a composite score: 50% capacity, 30% distance, 20% response speed. Twilio handles the coordination loop via SMS.' },
            { title: 'Demo in 60 seconds',body: 'Dashboard → live urgent alerts → click Rescue → AI ranks food banks → confirm → SMS fires → food bank replies 1 → donor gets confirmation → impact counter updates live.' },
            { title: 'Path to users',     body: 'Free pilot with 3 university dining directors. Partner with 2 Greater Boston food banks. Month 2: grocery chain community programs. Month 3: campus sustainability reporting API integration.' },
          ].map(c => (
            <div key={c.title} className="bg-gray-50 rounded-xl border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-900 mb-2">{c.title}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Tech stack</p>
          <div className="flex flex-wrap gap-2">
            {STACK.map(t => <span key={t} className="text-xs px-3 py-1.5 border border-gray-200 rounded-full text-gray-600 bg-white">{t}</span>)}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-4">Resume bullets</p>
          <div className="space-y-4">
            {BULLETS.map(b => (
              <div key={b.type} className="border-l-2 border-green-300 pl-4">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">{b.type}</p>
                <p className="text-sm text-gray-600 leading-relaxed italic">"{b.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

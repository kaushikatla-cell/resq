'use client';
import { useState, useTransition } from 'react';
import { createSurplus } from '@/actions/createSurplus';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'hot_entrees', label: '🍲 Hot Entrées' },
  { value: 'bakery',      label: '🍞 Bakery' },
  { value: 'salad',       label: '🥗 Salad Bar' },
  { value: 'produce',     label: '🥦 Produce' },
  { value: 'dairy',       label: '🥛 Dairy' },
  { value: 'other',       label: '📦 Other' },
];

export function AddSurplusForm({ donors }: { donors: { id: string; name: string }[] }) {
  const [open, setOpen]             = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createSurplus(formData);
      if (result?.error) { toast.error(result.error); return; }
      toast.success(`Surplus submitted! AI predicted ${result?.predictedQty ?? '?'} servings at risk.`);
      setOpen(false);
    });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">
        <span className="flex items-center gap-2"><span className="text-green-600 text-lg">+</span>Report new surplus</span>
        <span className="text-gray-400 text-xs">{open ? '▲ Collapse' : '▼ Expand'}</span>
      </button>
      {open && (
        <form action={handleSubmit} className="border-t border-gray-100 px-5 py-5 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Dining hall / donor</label>
            <select name="donorId" required className="input">
              <option value="">Select a donor…</option>
              {donors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select name="category" required className="input">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Quantity (servings)</label>
            <input name="quantity" type="number" min="1" max="5000" required placeholder="e.g. 47" className="input" />
          </div>
          <div className="col-span-2">
            <label className="label">Expires at</label>
            <input name="expiresAt" type="datetime-local" required className="input" min={new Date().toISOString().slice(0,16)} />
          </div>
          <div className="col-span-2">
            <label className="label">Description (optional)</label>
            <input name="description" type="text" placeholder="e.g. Leftover pasta, desserts…" className="input" />
          </div>
          <div className="col-span-2 flex items-center justify-between gap-4 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-500 hover:text-gray-800">Cancel</button>
            <button type="submit" disabled={isPending} className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
              {isPending ? 'Submitting…' : 'Submit surplus'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

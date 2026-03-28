import { createRescue } from '@/actions/createRescue';
import type { FoodBankRanked } from '@/types';

export function BankMatchCard({ bank, rank, surplusId }: { bank: FoodBankRanked; rank: number; surplusId: string }) {
  const capacityPct = Math.round((1 - bank.current_load / bank.capacity) * 100);
  const isBest = rank === 0;
  return (
    <div className={`bg-white rounded-xl border p-5 flex items-center gap-4 ${isBest ? 'border-green-300 ring-1 ring-green-200' : 'border-gray-100'}`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${isBest ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{rank + 1}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-medium text-sm text-gray-900 truncate">{bank.name}</p>
          {isBest && <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">Best match</span>}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
          <span>📍 {bank.distance_miles.toFixed(1)} mi</span>
          <span>⏱ ~{Math.round(bank.duration_minutes)} min</span>
          <span>📦 {bank.current_load}/{bank.capacity}</span>
        </div>
        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden w-48 max-w-full">
          <div className={`h-full rounded-full ${capacityPct > 60 ? 'bg-green-400' : capacityPct > 30 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${capacityPct}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{capacityPct}% available · avg {bank.avg_response_min} min response</p>
      </div>
      <div className="text-center flex-shrink-0 w-14">
        <div className={`text-2xl font-semibold ${bank.score >= 80 ? 'text-green-600' : bank.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{bank.score}</div>
        <div className="text-xs text-gray-400">AI score</div>
      </div>
      <form action={createRescue} className="flex-shrink-0">
        <input type="hidden" name="surplusId"     value={surplusId} />
        <input type="hidden" name="bankId"        value={bank.id} />
        <input type="hidden" name="matchScore"    value={bank.score} />
        <input type="hidden" name="distanceMiles" value={bank.distance_miles} />
        <button type="submit" className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${isBest ? 'bg-green-500 text-white hover:bg-green-600' : 'border border-gray-200 text-gray-700 hover:border-gray-400'}`}>Select</button>
      </form>
    </div>
  );
}

import type { PredictFeatures } from '@/types';

export async function getPrediction(features: PredictFeatures): Promise<number | null> {
  const url = process.env.ML_SERVICE_URL;
  if (!url) return null;
  try {
    const res = await fetch(`${url}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.predicted_surplus === 'number' ? data.predicted_surplus : null;
  } catch { return null; }
}

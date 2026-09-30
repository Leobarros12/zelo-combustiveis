import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';

// Initialize Supabase client using Vite env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Retrieves fuel prices for a station, using cache logic.
 *
 * @param stationId - UUID of the station
 * @param lat - Latitude of the station (used for Infosimples API request)
 * @param lng - Longitude of the station
 * @returns An array of price objects { fuel_type, price, updated_at }
 */
export async function getStationPrices(
  stationId: string,
  lat: number,
  lng: number
): Promise<Array<{ fuel_type: string; price: number; updated_at: string }>> {
  // 1. Try to fetch cached prices from Supabase
  const { data: cachedPrices, error: fetchError } = await supabase
    .from('fuel_prices')
    .select('fuel_type, price, updated_at')
    .eq('station_id', stationId);

  if (fetchError) {
    console.error('Supabase fetch error:', fetchError);
    // Continue to API fallback
  } else if (cachedPrices && cachedPrices.length > 0) {
    // Check if the most recent updated_at is within 3 hours
    const now = new Date();
    const freshest = new Date(cachedPrices[0].updated_at);
    const diffSec = (now.getTime() - freshest.getTime()) / 1000;
    if (diffSec < 10800) {
      // Cache still fresh – return it
      return cachedPrices as any;
    }
    // Cache stale – we will refresh below
  }

  // 2. Call Infosimples API (replace the placeholder token with your real token in .env)
  const token = import.meta.env.INFOSIMPLES_API_TOKEN;
  const apiUrl = `https://api.infosimples.com/v1/fuel-prices?lat=${lat}&lng=${lng}`;

  const response = await axios.get(apiUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Expect response data in format { prices: [{ fuel_type, price }, ...] }
  const prices = response.data.prices as Array<{ fuel_type: string; price: number }>;

  // 3. Upsert prices into Supabase
  const upsertPayload = prices.map(p => ({
    station_id: stationId,
    fuel_type: p.fuel_type,
    price: p.price,
    updated_at: new Date().toISOString(),
  }));

  const { error: upsertError } = await supabase
    .from('fuel_prices')
    .upsert(upsertPayload, { onConflict: 'station_id,fuel_type' });

  if (upsertError) {
    console.error('Supabase upsert error:', upsertError);
  }

  // 4. Update stations.updated_at to now
  await supabase
    .from('stations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', stationId);

  // Return fresh data (the just‑upserted payload)
  return upsertPayload;
}

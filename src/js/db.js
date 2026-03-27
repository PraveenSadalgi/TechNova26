import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'missing_url';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing_key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Globals to store current trip state
export let currentTripData = null;

// Ensures a row exists in `profiles` for the authenticated user.
// Required because trips.user_id FK references profiles(id).
async function ensureProfile(user) {
  const fullName = user.user_metadata?.full_name || user.email || '';
  const { error } = await supabase
    .from('profiles')
    .upsert([{ id: user.id, full_name: fullName }], { onConflict: 'id' });
  if (error) {
    console.warn('[PlanIt] Profile upsert warning:', error.message, '— proceeding anyway');
  }
}

export async function saveTripAndItinerary(destination, startDate, endDate, numDays, itemsData) {
  // 1. Get authenticated user
  const { data: { user }, error: userErr } = await supabase.auth.getUser();

  if (userErr || !user) {
    throw new Error('You must be signed in to save a trip. Please sign in.');
  }

  // 2. Guarantee the profile row exists (satisfies trips.user_id FK → profiles.id)
  await ensureProfile(user);

  // 3. Insert Trip
  const { data: trip, error: tripErr } = await supabase
    .from('trips')
    .insert([{
      user_id: user.id,
      destination,
      start_date: startDate || null,
      end_date: endDate || null,
      num_days: numDays || null,
      status: 'upcoming'
    }])
    .select()
    .single();

  if (tripErr) {
    // Provide a friendlier error message for the FK violation
    if (tripErr.code === '23503') {
      throw new Error(
        'Could not save trip: your profile record is missing in the database. ' +
        'Please sign out, sign back in, and try again. If this persists, contact support.'
      );
    }
    throw tripErr;
  }

  // 4. Insert Itinerary Items
  const insertItems = itemsData.map(item => ({
    trip_id: trip.id,
    category: item.category,
    name: item.name,
    description: item.description,
    ai_generated: true
  }));

  const { error: itemsErr } = await supabase
    .from('itinerary_items')
    .insert(insertItems);

  if (itemsErr) throw itemsErr;

  return trip;
}

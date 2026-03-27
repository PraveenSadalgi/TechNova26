import { GoogleGenerativeAI } from "@google/generative-ai";

// ─────────────────────────────────────────────────
//  RICH MOCK DATA  (real names, unique per destination)
// ─────────────────────────────────────────────────
export const MOCK_DATA = {

  "Bangalore, India": {
    places: [
      { name: "Lalbagh Botanical Garden",      description: "150-acre garden with a glasshouse modelled after London's Crystal Palace.", category: "famous_place" },
      { name: "Bangalore Palace",               description: "1887 Tudor-style royal palace surrounded by lush gardens and turrets.", category: "famous_place" },
      { name: "Cubbon Park",                    description: "Century-old shaded park in the city centre, perfect for morning walks.", category: "famous_place" },
      { name: "ISKCON Temple Bangalore",        description: "One of India's largest Krishna temples, stunning at dusk.", category: "famous_place" },
      { name: "Vidhana Soudha",                 description: "Magnificent neo-Dravidian seat of Karnataka's state legislature.", category: "famous_place" },
      { name: "Tipu Sultan's Summer Palace",    description: "An intricate teak palace used by Tipu Sultan during wars.", category: "famous_place" },
    ],
    stays: [
      { name: "The Taj West End",               description: "Heritage 5-star set in 20 acres of garden — Bangalore's most storied address.", category: "stay" },
      { name: "ITC Gardenia",                   description: "LEED Platinum eco-luxury tower with a rooftop pool and the famous Ottimo restaurant.", category: "stay" },
      { name: "The Oberoi Bengaluru",           description: "Contemporary luxury with exceptional service in the heart of UB City.", category: "stay" },
      { name: "Leela Palace Bengaluru",         description: "Palace-style suites, grand chandeliers and a glittering spa.", category: "stay" },
      { name: "JW Marriott Hotel Bengaluru",    description: "Soaring tower stay with live music and stunning city-view rooms.", category: "stay" },
    ],
    restaurants: [
      { name: "Vidyarthi Bhavan",               description: "Legendary since 1943 — the crispiest ghee-dosas around, served on banana leaf.", category: "restaurant" },
      { name: "Toit Brewpub",                   description: "Bangalore's most celebrated craft brewery with wood-fired pizzas.", category: "restaurant" },
      { name: "MTR (Mavalli Tiffin Room)",      description: "Iconic 100-year-old breakfast institution famed for rava idli.", category: "restaurant" },
      { name: "The Only Place",                 description: "Beloved Western steakhouse serving Bangalore since 1962.", category: "restaurant" },
      { name: "Karavalli",                      description: "Award-winning coastal Karnataka seafood — must try neer dosa & crab.", category: "restaurant" },
      { name: "Brahmin's Coffee Bar",           description: "No-frills legend for South Indian filter coffee and soft idli.", category: "restaurant" },
    ],
  },

  "New Delhi, India": {
    places: [
      { name: "Red Fort (Lal Qila)",            description: "UNESCO World Heritage Mughal fort on the banks of Yamuna — 1638 CE.", category: "famous_place" },
      { name: "India Gate",                     description: "42-metre war memorial at the heart of Lutyens' Delhi.", category: "famous_place" },
      { name: "Qutub Minar",                    description: "World's tallest brick minaret, built in 1193 — a UNESCO jewel.", category: "famous_place" },
      { name: "Humayun's Tomb",                 description: "First garden tomb of the Indian subcontinent, precursor to Taj Mahal.", category: "famous_place" },
      { name: "Lotus Temple",                   description: "Striking Bahá'í House of Worship shaped like an unfolding lotus.", category: "famous_place" },
      { name: "Chandni Chowk",                  description: "One of India's oldest bazaars — bustling lanes of spices, street food & silver.", category: "famous_place" },
    ],
    stays: [
      { name: "The Leela Palace New Delhi",     description: "Ultra-luxury palace on Diplomatic Enclave with a sky-high pool.", category: "stay" },
      { name: "Taj Mahal Hotel New Delhi",      description: "Iconic 5-star landmark facing Willingdon Crescent and the India Gate.", category: "stay" },
      { name: "The Imperial New Delhi",         description: "A 1931 Art Deco masterpiece — the most storied hotel in Delhi.", category: "stay" },
      { name: "ITC Maurya New Delhi",           description: "Home to the legendary Bukhara restaurant and stunning marble suites.", category: "stay" },
      { name: "The Lodhi Hotel",                description: "Award-winning boutique luxury with 47 pool villas, right on Lodhi Gardens.", category: "stay" },
    ],
    restaurants: [
      { name: "Bukhara",                        description: "San Pellegrino's best restaurant in Asia — slow-cooked dal makhani since 1978.", category: "restaurant" },
      { name: "Indian Accent",                  description: "Contemporary Indian fine dining that reinvented the national palate.", category: "restaurant" },
      { name: "Karim's Jama Masjid",            description: "Legendary Old Delhi institution for mutton korma & seekh kebabs since 1913.", category: "restaurant" },
      { name: "Farzi Café",                     description: "Modern molecular Indian cuisine in Cyber Hub, Delhi.", category: "restaurant" },
      { name: "Gulati Restaurant",              description: "Pandara Road's most celebrated butter chicken and dal makhani.", category: "restaurant" },
      { name: "Paranthe Wali Gali",             description: "Chandni Chowk alley famous for 150+ varieties of stuffed paranthas.", category: "restaurant" },
    ],
  },

  "Mysore, Karnataka": {
    places: [
      { name: "Mysore Palace (Amba Vilas)",     description: "One of India's most visited sites — illuminated by 100,000 bulbs at night.", category: "famous_place" },
      { name: "Chamundi Hill & Nandi Bull",     description: "1,000-step sacred hill with panoramic city views and a 5m carved Nandi statue.", category: "famous_place" },
      { name: "Brindavan Gardens",              description: "Musical fountain garden below KRS Dam — spectacular after dusk.", category: "famous_place" },
      { name: "St. Philomena's Cathedral",      description: "Neo-Gothic cathedral with stunning stained glass — one of Asia's largest.", category: "famous_place" },
      { name: "Mysore Zoo (Sri Chamarajendra)",  description: "150-year-old zoological garden, one of India's best maintained.", category: "famous_place" },
      { name: "Devaraja Market",                description: "Colourful market stacking incense, jasmine, spices and sandalwood crafts.", category: "famous_place" },
    ],
    stays: [
      { name: "Lalitha Mahal Palace Hotel",     description: "Karnataka Tourism's iconic 1921 palace hotel overlooking Chamundi Hill.", category: "stay" },
      { name: "Radisson Blu Plaza Hotel Mysuru", description: "Contemporary 5-star with rooftop pool and city views.", category: "stay" },
      { name: "Royal Orchid Metropole",         description: "Restored 1920s heritage hotel once used by the Maharaja's guests.", category: "stay" },
      { name: "Sandesh The Prince",             description: "Elegant boutique hotel nestled among mango and mahua trees.", category: "stay" },
    ],
    restaurants: [
      { name: "Mylari Hotel",                   description: "Beloved institution — feather-soft naan and fragrant mutton sagu since 1949.", category: "restaurant" },
      { name: "Vinayaka Mylari",                description: "Sister eatery well-known for delicate rava idli and filter coffee.", category: "restaurant" },
      { name: "Hotel RRR",                      description: "Famous mini-tiffin thali featuring Karnataka-style gravies and rice.", category: "restaurant" },
      { name: "Pelican Bar & Restaurant",       description: "Mysore's go-to spot for biryani and coastal seafood platters.", category: "restaurant" },
      { name: "Tiffany's",                      description: "Long-standing bakery-café popular for Mysore pak and local sweets.", category: "restaurant" },
    ],
  },

};

// ─────────────────────────────────────────────────
//  RANDOM ITINERARY BUILDER
//  Picks a random subset so each plan feels unique
// ─────────────────────────────────────────────────
function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

function buildRandomItinerary(destination) {
  const base = MOCK_DATA[destination];
  if (!base) {
    // Generic fallback for destinations not in mock data
    return {
      places:      [{ name: `City Centre of ${destination}`,  description: "The vibrant heart of the city full of local culture.", category: "famous_place" }],
      stays:       [{ name: `Grand Hotel ${destination}`,     description: "Comfortable, centrally located premium stay.",        category: "stay" }],
      restaurants: [{ name: `The Local Kitchen, ${destination}`, description: "Best local cuisine in town.",                     category: "restaurant" }],
    };
  }

  return {
    places:      pickRandom(base.places,      3),
    stays:       pickRandom(base.stays,       1),
    restaurants: pickRandom(base.restaurants, 2),
  };
}

// ─────────────────────────────────────────────────
//  MAIN EXPORT — tries Gemini, falls back to mock
// ─────────────────────────────────────────────────
export async function generateItinerary(destination, days, people) {
  const currentKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Try live Gemini API first
  if (currentKey && !currentKey.includes('your_gemini')) {
    try {
      const genAI = new GoogleGenerativeAI(currentKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are a premium travel expert. Plan a trip to ${destination} for ${days} days, group of ${people}.
Return ONLY valid JSON (no markdown) in exactly this shape:
{
  "places":      [{ "name": "...", "description": "...", "category": "famous_place" }],
  "stays":       [{ "name": "...", "description": "...", "category": "stay" }],
  "restaurants": [{ "name": "...", "description": "...", "category": "restaurant" }]
}
Include 3 places, 1 stay, 2 restaurants using real, well-known names.`;

      const result   = await model.generateContent(prompt);
      let   text     = result.response.text().replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(text);
    } catch (e) {
      console.warn("Gemini API unavailable, using mock data:", e.message);
    }
  }

  // Simulate a 1-second AI "thinking" delay, then return random mock data
  await new Promise(r => setTimeout(r, 1000));
  return buildRandomItinerary(destination);
}

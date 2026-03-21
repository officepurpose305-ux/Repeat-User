# Real Data Integration Setup

This document explains how the real property data from Excel/PDF documents will be integrated into the 99acres homepage system.

## Current Status

✅ **Infrastructure Complete** — All pieces are in place to store and serve real property data.

### What's Been Set Up

1. **Supabase Tables** (`supabase/migrations/005_real_properties_and_localities.sql`)
   - `real_properties` table — stores actual property listings
   - `real_localities` table — stores locality metadata (avg price, YoY growth, metro distance, etc.)

2. **Data Seeding Script** (`api/seed-real-data.js`)
   - Template file ready to import data from Excel/PDF
   - Just fill in the PROPERTIES_DATA and LOCALITIES_DATA arrays

3. **Homepage Fallback Chain** (in `v2/homepage/index.html`)
   - Real data fetch function: `fetchRealDataFromSupabase()`
   - Integrated into priority chain as step 5 of 6:
     1. 99acres Real API
     2. Supabase Cache (previous API responses)
     3. OpenAI Pre-fetched (panel "Apply" button)
     4. OpenAI Live Call
     5. **Real Data from Supabase** ← NEW
     6. Intelligent Mock Data (fallback)

## How to Populate Real Data

### Step 1: Extract Data from Excel/PDF

**Source Files:**
- `india_city_locality_data.xlsx` — Contains locality metadata
- `India_Properties_99acres_1.pdf` — Contains 150 actual property listings

**Expected Data Structure:**

**Localities (from Excel):**
```javascript
{
  city: 'Noida',
  name: 'Sector 75',
  avg_price_sqft: 5200,        // Average price per sqft
  yoy_growth: 8.5,             // Year-over-year growth %
  metro_distance_min: 2.1,     // Nearest metro distance (km)
  schools_count: 8,
  hospitals_count: 3,
  markets_count: 4,
  popular_insights: 'Metro proximity, established residential area',
  rank: 1                       // Preference rank
}
```

**Properties (from PDF):**
```javascript
{
  city: 'Noida',
  locality: 'Sector 75',
  name: 'Emaar Emerald Estate',
  developer: 'Emaar MGF Land Ltd',
  bhk: ['2BHK', '3BHK'],       // Array of available BHK types
  price_min: 65,               // Minimum price (Lakhs)
  price_max: 95,               // Maximum price (Lakhs)
  price_avg_sqft: 5200,
  area_sqft: 1200,
  status: 'Under Construction',
  ready_to_move: false,
  rera_number: 'RERA/UP/NOIDA/PR/1234',
  possession_date: '2026-06',
  landmarks: {
    metro: '2.1 km',
    school: '0.8 km',
    hospital: '1.2 km',
    market: '0.5 km'
  },
  amenities: ['Swimming Pool', 'Gym', 'Playground', 'Security'],
  image_url: 'https://example.com/image.jpg',
  listing_url: 'https://99acres.com/property/...'
}
```

### Step 2: Fill in the Seed Script

Edit `api/seed-real-data.js`:

```javascript
const LOCALITIES_DATA = {
  noida: [
    {
      name: 'Sector 75',
      avg_price_sqft: 5200,
      yoy_growth: 8.5,
      metro_distance_min: 2.1,
      schools_count: 8,
      hospitals_count: 3,
      markets_count: 4,
      popular_insights: 'Metro proximity, established residential area',
      rank: 1
    },
    // ... more localities
  ],
  bangalore: [
    // ... Bangalore localities
  ],
  // ... other cities
};

const PROPERTIES_DATA = [
  {
    city: 'Noida',
    locality: 'Sector 75',
    name: 'Emaar Emerald Estate',
    // ... full property details
  },
  // ... 149 more properties
];
```

### Step 3: Run the Seeding Script

```bash
# Make sure .env is set up with Supabase credentials
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-key"

# Run the seed script
node api/seed-real-data.js

# Expected output:
# Seeding localities...
# ✓ Seeded Noida/Sector 75
# ✓ Seeded 15 localities
# ✓ Seeded 150 properties
```

### Step 4: Verify Data in Supabase

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run:
```sql
SELECT COUNT(*) FROM public.real_properties;
SELECT COUNT(*) FROM public.real_localities;
```

Should show:
- 150 properties
- 15 localities

## How the Homepage Uses Real Data

Once data is seeded into Supabase:

1. **User opens homepage or panel changes location**
   - Homepage calls `fetchAndRender()`

2. **fetchData() runs through fallback chain:**
   - Tries real API (if available)
   - Checks Supabase cache (if exists)
   - Tries OpenAI (if key available)
   - **Fetches real Supabase data** ← Uses your data
   - Falls back to intelligent mock data

3. **Real data is transformed and displayed:**
   - Properties show in "Continue Where You Left Off" section
   - Locality cards use real metadata (avg price/sqft, YoY growth)
   - All property cards show real images, developers, prices

## Persona Integration

The 5 research personas now use Noida-specific localities:

| Persona | Stage | Localities | Budget |
|---------|-------|-----------|--------|
| Priya | S2 | Sector 137 | ₹70–95L |
| Rahul | S2 | Sector 137 | ₹75–90L |
| Meera | S3 | Sector 135, 143 | ₹50–60L |
| Vikram | S3 | Sector 75, 107 | ₹100–150L |
| Ankit | S4 | Sector 137 | ₹120–150L |

All S3 personas (Meera, Vikram) now use **Noida-only** localities for consistent comparison.

## Data Priority for Each Locality

### Sector 75 (S3 primary for Vikram)
- Should have 8–12 properties in the seed data
- Include mixed BHK (2BHK and 3BHK for investor comparison)
- Price range: ₹100–150L

### Sector 107 (S3 secondary for Vikram)
- Should have 4–6 properties
- Include appreciation story (YoY growth data)
- Price range: ₹90–130L (slightly lower than 75)

### Sector 135 (S3 primary for Meera)
- Should have 6–10 properties
- Budget-friendly: ₹50–70L
- Highlight affordable options, school/hospital proximity

### Sector 143 (S3 secondary for Meera)
- Should have 4–6 properties
- Budget-friendly: ₹50–65L
- Alternative cheaper zone for comparison

### Sector 137 (S2 & S4)
- Should have 10–15 properties (most visited by Priya, Rahul, Ankit)
- Mix of RTM and UC
- Price range: ₹70–150L (covers S2 budget + S4 upgrade budget)

## Testing Checklist

Once data is seeded:

- [ ] Load Priya (S2) — see 2-4 properties from Sector 137
- [ ] Load Meera (S3) — see H2H comparison between Sector 135 vs 143
- [ ] Load Vikram (S3) — see investor-focused comparison between Sector 75 vs 107
- [ ] Load Ankit (S4) — see top property decision card from Sector 137
- [ ] All property cards show real images, real developers, real prices
- [ ] Locality cards show real avg price/sqft and YoY growth
- [ ] Console logs "Using real-data" as data source
- [ ] Data persists across page reload (Supabase RLS allows public read)

## File References

| File | Purpose |
|------|---------|
| `supabase/migrations/005_real_properties_and_localities.sql` | Table schema + RLS policies |
| `api/seed-real-data.js` | Data import template |
| `v2/homepage/index.html` (line ~1075) | `fetchRealDataFromSupabase()` function |
| `v2/homepage/index.html` (line ~995) | Fallback chain integration |
| `v2/panel/index.html` (line ~854) | Updated persona definitions |

## Next Steps

1. Extract property and locality data from the provided Excel/PDF documents
2. Fill in `PROPERTIES_DATA` and `LOCALITIES_DATA` in `api/seed-real-data.js`
3. Run the seed script
4. Test with each persona in the panel
5. Homepage will automatically show real data in the fallback chain

---

**Created:** 2026-03-21
**Status:** Ready for data import

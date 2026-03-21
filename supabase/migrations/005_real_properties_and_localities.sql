-- Real Properties and Localities Data Tables
-- Stores actual 99acres property data and locality metadata for fallback when API is unavailable

-- Drop existing tables if they exist (fresh start for data seeding)
DROP TABLE IF EXISTS public.real_properties CASCADE;
DROP TABLE IF EXISTS public.real_localities CASCADE;

-- Real Localities Table
-- Stores metadata for each locality: average price/sqft, YoY growth, distances, insights
CREATE TABLE public.real_localities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  name text NOT NULL,
  avg_price_sqft numeric,           -- Average price per sqft in the locality
  yoy_growth numeric,               -- Year-over-year growth percentage
  metro_distance_min numeric,       -- Distance to nearest metro in km
  schools_count integer,            -- Count of schools in locality
  hospitals_count integer,          -- Count of hospitals
  markets_count integer,            -- Count of shopping areas
  popular_insights text,            -- Key selling points / insights for the locality
  rank integer,                     -- Popularity/preference rank for the city
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(city, name)
);

-- Real Properties Table
-- Stores actual 99acres property listings with full metadata
CREATE TABLE public.real_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  locality text NOT NULL,           -- Locality name (must match real_localities.name)
  name text NOT NULL,               -- Project/property name
  developer text,                   -- Developer/builder name
  bhk text[],                       -- Array of BHK types offered: ['2BHK'], ['3BHK'], ['2BHK', '3BHK']
  price_min numeric,                -- Minimum price in lakhs
  price_max numeric,                -- Maximum price in lakhs
  price_avg_sqft numeric,           -- Price per sqft
  area_sqft integer,                -- Carpet area in sqft
  status text,                      -- Ready to move, Under construction, etc.
  ready_to_move boolean DEFAULT false,
  rera_number text,                 -- RERA registration number
  possession_date text,             -- Possession timeline
  landmarks jsonb,                  -- JSON object with distances: {metro: "2km", school: "1.5km"}
  amenities text[],                 -- Array of amenities: ['gym', 'swimming pool', 'playground']
  image_url text,                   -- Image URL for the property
  listing_url text,                 -- URL to the listing on 99acres
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for faster queries
CREATE INDEX idx_real_properties_city_locality ON public.real_properties(city, locality);
CREATE INDEX idx_real_properties_bhk ON public.real_properties USING GIN(bhk);
CREATE INDEX idx_real_properties_price ON public.real_properties(price_min, price_max);
CREATE INDEX idx_real_localities_city ON public.real_localities(city);

-- Enable RLS
ALTER TABLE public.real_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_localities ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allow all operations for now)
CREATE POLICY "Allow all real_properties access" ON public.real_properties
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all real_localities access" ON public.real_localities
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.real_properties TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.real_localities TO anon, authenticated;

-- Add updated_at trigger for real_properties
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_real_properties_updated_at BEFORE UPDATE
  ON public.real_properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_real_localities_updated_at BEFORE UPDATE
  ON public.real_localities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

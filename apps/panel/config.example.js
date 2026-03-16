// Copy this file to config.js and add your credentials. config.js is gitignored.
window.SUPABASE_URL = 'https://your-project.supabase.co';
window.SUPABASE_ANON_KEY = 'your-anon-key';

// Optional: OpenAI API key — used for location resolution (city vs locality) and for automatic localities + properties when 99acres is unavailable.
// Add to config.js: window.OPENAI_API_KEY = 'sk-proj-...';

// 99acres API base URL — required for user interviews. Homepage shows real market data only when this is set to your real API (entities, search-urls, listings). No dummy fallback.
// Add to config.js: window.NINETY_NINE_ACRES_API_BASE = 'https://your-99acres-api.example.com';

# Mock 99acres API

Local mock for the 99acres entities/listings API so the researcher panel and buyer homepage can load properties without the real backend.

## Run

```bash
node api/99acres-mock-server.js
```

Listens on **http://localhost:5003** (override with `PORT=3000 node api/99acres-mock-server.js`).

## Use with the app

Point the app at this server:

- In **apps/panel/config.js**:  
  `window.NINETY_NINE_ACRES_API_BASE = 'http://localhost:5003';`
- Or open the homepage with the panel; the panel sends `apiBase` in config when that variable is set.

If the app is opened from another host/port, CORS is enabled (`Access-Control-Allow-Origin: *`).

## Endpoints

| Path | Description |
|------|-------------|
| `GET /debug/entities?query=...` | Parses query (e.g. "2 BHK flat for sale in Sarjapur Bangalore"), returns `{ city, locality, bedroom }`. |
| `GET /debug/search-urls?entities=...` | Returns `{ url, search_url, buy_url }` for 99acres. |
| `GET /search?entities=...&limit=8` | Mock property list (same as listings). |
| `GET /listings?entities=...&limit=8` | Mock property list. |
| `GET /api/properties?city=...&locality=...&bedroom=...&limit=8` | Mock property list by params. |

Mock listings include id, name, location, price, area, bedroom, status, image_url so the homepage can render cards.

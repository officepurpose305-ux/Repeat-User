# Debug: Homepage API Data Loading

## Quick Checklist

### 1. **Is the mock server running?**

Open a terminal and run:
```bash
node /Users/fa061462/Documents/Cursor/api/99acres-mock-server.js
```

You should see:
```
🌐 99acres Mock API running on http://localhost:5003
✓ CORS enabled
```

**If it fails**: Check that the file exists and Node is installed (`node --version`).

---

### 2. **Is config.js being loaded?**

Open the browser console (F12) and check:
```javascript
console.log('window.NINETY_NINE_ACRES_API_BASE:', window.NINETY_NINE_ACRES_API_BASE);
console.log('window.OPENAI_API_KEY:', window.OPENAI_API_KEY);
```

**Expected output**:
```
window.NINETY_NINE_ACRES_API_BASE: http://localhost:5003
window.OPENAI_API_KEY: sk-proj-...
```

**If it shows `undefined`**:
- config.js wasn't loaded. Check that `/v2/panel/config.js` exists
- Check browser console for any 404 errors on config.js

---

### 3. **Is the panel sending config to homepage?**

In browser console (on the panel page):
```javascript
// Check if profile is defined
console.log('profile:', profile);

// Manually trigger send
sendToIframe(profile);
```

You should see output like:
```
profile: {user: {name: 'Priya Mehta', ...}, location: {primary: 'Sector 137', ...}, ...}
```

---

### 4. **Is the homepage receiving the config?**

Open the **iframe preview** in the panel, then open its console (right-click → Inspect → Console).

Look for:
```
[CONFIG_UPDATE] Received config: {location: {...}, apiBase: 'http://localhost:5003', ...}
```

**If you don't see this message**: The postMessage isn't arriving. Check:
- Panel's `sendToIframe()` is being called
- Iframe src is `../homepage/index.html`
- No cross-origin issues

---

### 5. **Is the API call being made?**

In the **iframe console**, you should see:
```
[fetchData] === STARTING MULTI-SOURCE FALLBACK ===
[fetchData] Called with: {apiBase: 'http://localhost:5003', primary: 'Sector 137', ...}
[fetchData] 1. Attempting 99acres API...
[99acres] Calling entities: http://localhost:5003/debug/entities?text=...
```

**If you don't see these logs**:
- The homepage didn't receive CONFIG_UPDATE
- Or the fetch didn't trigger (check step 4)

---

### 6. **What does the API respond with?**

If you see the `[99acres]` logs, check the response:
```
[99acres] Entities response: {locality: 'Sector 137', city: 'Noida', ...}
[99acres] Calling search-urls
[99acres] Search-urls response keys: ['content']
[99acres] Page content length: 2541
```

**If Page content length is 0**: The API returned empty content. Check the mock server is returning valid data.

---

### 7. **Are properties being parsed?**

Look for:
```
[99acres] parseApiListings returned 3 properties
[99acres] SUCCESS: returning 3 properties
```

**If parseApiListings returned 0**: The API content format might have changed, or the regex pattern isn't matching.

---

## Common Issues & Fixes

| Issue | Symptom | Fix |
|-------|---------|-----|
| Mock server not running | `[99acres] Error: fetch failed` or timeout | Run: `node api/99acres-mock-server.js` |
| config.js not found | `window.NINETY_NINE_ACRES_API_BASE` is undefined | Copy `v2/panel/config.example.js` → `v2/panel/config.js` and fill in values |
| Wrong API endpoint | Fetch succeeds but returns wrong format | Update config.js: `window.NINETY_NINE_ACRES_API_BASE = 'http://localhost:5003'` (no `/proxy`) |
| Iframe not loading | No CONFIG_UPDATE in iframe console | Refresh both panel and iframe |
| Network tab shows failed requests | 404 on `/debug/entities` | Start mock server; check it's running on 5003 |
| Properties show but no images | Images missing from properties | Mock server doesn't include image URLs — check parseApiListings for image_url field |

---

## Full Debug Session Example

**Terminal 1:**
```bash
cd /Users/fa061462/Documents/Cursor
node api/99acres-mock-server.js
# Output: 🌐 99acres Mock API running on http://localhost:5003
```

**Browser (Panel page, F12 Console):**
```javascript
// Step 1: Check config
window.NINETY_NINE_ACRES_API_BASE
// Output: 'http://localhost:5003' ✓

// Step 2: Check profile
profile.location.primary
// Output: 'Sector 137' ✓

// Step 3: Trigger send
sendToIframe(profile)
// Check iframe console for [CONFIG_UPDATE] ✓
```

**Browser (Iframe preview, F12 Console):**
```
[CONFIG_UPDATE] Received config: {location: {primary: 'Sector 137', ...}, apiBase: 'http://localhost:5003', ...}
[fetchData] === STARTING MULTI-SOURCE FALLBACK ===
[fetchData] 1. Attempting 99acres API...
[99acres] Calling entities: http://localhost:5003/debug/entities?text=Sector%20137
[99acres] Entities response: {locality: 'Sector 137', ...}
[99acres] Calling search-urls
[99acres] Search-urls response keys: ['content']
[99acres] Page content length: 2541
[99acres] parseApiListings returned 3 properties
[99acres] SUCCESS: returning 3 properties
[fetchAndRender] fetchData returned: {propertiesCount: 3, hasImageUrls: true, ...}
```

✅ If you see this sequence, data loading is working!

---

## Next Steps

1. **Run the debug checklist above** and let me know which step fails
2. **Share the console logs** from that step
3. I can then identify the exact issue and fix it

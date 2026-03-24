# Panel ↔ Homepage Sync Audit Report

## 🔍 Current Status: **PARTIALLY IN SYNC** ⚠️

The researcher panel and v3 homepage have proper communication infrastructure, but the panel is **pointing to the wrong homepage**.

---

## ❌ Issue Found

**Panel is pointing to OLD homepage:**
```html
<!-- Current (WRONG) -->
<iframe id="preview-iframe" src="../homepage/index.html" ...>
<!-- This loads: Repeat Users Homepage/homepage/index.html (v2) -->
```

**Should point to NEW v3 homepage:**
```html
<!-- Needed (CORRECT) -->
<iframe id="preview-iframe" src="../../../v3/homepage/index.html" ...>
<!-- This loads: v3/homepage/index.html (your fresh redesign) -->
```

---

## ✅ What IS Working

### 1. **postMessage Communication** ✓
Panel function exists: `sendToIframe(profile)` at line 1343
```javascript
iframe.contentWindow.postMessage({ type: 'CONFIG_UPDATE', config: payload }, '*');
```

V3 homepage listener exists: line 542
```javascript
window.addEventListener('message', function(e) {
  if (e.data.type === 'CONFIG_UPDATE') {
    // Process config update
  }
});
```

### 2. **Config Structure** ✓
Panel sends complete profile object:
```javascript
{
  stage: 1-5,
  location: { primary, secondary, city },
  filters: { bhk, budgetMin, budgetMax, readyToMove },
  user: { name, worksNear, ... },
  apiBase, openAIKey  // injected at send time
}
```

V3 homepage receives and processes via `defaultConfig()` ✓

### 3. **Stage Logic** ✓
Panel's `inferStage()` function calculates S1-S5 based on behavior signals
V3 homepage's `renderPage()` uses stage to show/hide modules
All compatible ✓

### 4. **Supabase Real-time Sync** ✓
Panel writes to `live_config` table
V3 homepage listens to `live_config` changes
Cross-device sync works ✓

---

## 📊 Sync Checklist

| Component | Panel | V3 Homepage | Status |
|-----------|-------|-----------|--------|
| **Message Listener** | ✓ `sendToIframe()` | ✓ `addEventListener('message')` | ✅ In sync |
| **Config Structure** | ✓ Sends complete profile | ✓ Receives via `defaultConfig()` | ✅ Compatible |
| **Stage Logic** | ✓ `inferStage()` calculates | ✓ `renderPage()` uses stage | ✅ In sync |
| **Data Processing** | ✓ Form → profile object | ✓ Config → data fetching | ✅ In sync |
| **Supabase Integration** | ✓ Writes to `live_config` | ✓ Listens to real-time | ✅ In sync |
| **Persona Dropdown** | ✓ Pre-defined personas | ✓ `loadDemoConfig()` fallback | ✅ Compatible |
| **iframe Source** | ❌ Points to OLD v2 | ✓ V3 homepage ready | ⚠️ **MISMATCH** |

---

## 🔧 Fix Required (1 Line Change)

### **File:** `Repeat Users Homepage/panel/index.html`
### **Line:** 781

**Change from:**
```html
<iframe id="preview-iframe" class="phone-screen" src="../homepage/index.html" title="Homepage preview"></iframe>
```

**Change to:**
```html
<iframe id="preview-iframe" class="phone-screen" src="../../../v3/homepage/index.html" title="Homepage preview"></iframe>
```

---

## 🧪 After Making the Fix

Once you update the iframe src, the panel and v3 homepage will be **fully in sync**:

1. **Open the panel** in browser
2. **Panel loads v3 homepage** in embedded iframe (360×760px phone mockup)
3. **Select a persona** from dropdown → panel form fills
4. **Toggle stage slider** S1→S5 → homepage re-renders in real-time
5. **Edit form fields** → debounced sync to homepage (400ms delay)
6. **"Apply" button** → runs OpenAI pipeline, updates homepage with AI data
7. **Multiple devices** → open standalone homepage on phone, tablet → stays in sync via Supabase

---

## 📋 Data Flow When In Sync

```
Panel Form
    ↓
Panel.collect() → profile object
    ↓
Panel.sync() → sendToIframe(profile)
    ↓
postMessage() to iframe with CONFIG_UPDATE
    ↓
V3 Homepage receives 'message' event
    ↓
config = Object.assign(defaultConfig(), e.data.config)
    ↓
fetchAndRender() → renders modules based on stage
    ↓
Homepage shows result in real-time
```

---

## 🔗 Also Syncs To:

### **Supabase real-time** (for cross-device sync)
```
Panel writes → live_config table
    ↓
V3 Homepage subscribes → real-time channel
    ↓
Standalone homepage (on another device) updates automatically
```

### **Panel Sessions** (saved search history)
```
Panel → Save session → sessions table
    ↓
Panel → Load session → profile populated → sendToIframe()
    ↓
V3 Homepage renders that session's config
```

---

## ✨ Once Fixed, You Get:

✅ Real-time panel ↔ homepage sync
✅ Stage toggle (S1-S5) updates homepage instantly
✅ Form changes (BHK, budget, etc.) filter properties live
✅ Persona dropdown loads pre-built buyer profiles
✅ "Apply" button runs AI pipeline → homepage updates
✅ Cross-device sync via Supabase (phone + laptop stay in sync)
✅ Session save/load works seamlessly
✅ All v3 fresh design features available

---

## 🎯 Action Required

**Option 1: Update Panel (Recommended)**
```
Edit: Repeat Users Homepage/panel/index.html
Line: 781
Change: src="../homepage/index.html"
To:     src="../../../v3/homepage/index.html"
Save & reload
```

**Option 2: Keep Both Versions**
Keep panel pointing to v2, switch to v3 by opening:
```
http://localhost:8000/v3/homepage/index.html
(Standalone, no panel controls)
```

---

## 📝 Current Paths

| File | Current Location | Status |
|------|------------------|--------|
| **Panel** | `Repeat Users Homepage/panel/index.html` | ✓ Active |
| **V2 Homepage** | `Repeat Users Homepage/homepage/index.html` | Currently used by panel |
| **V3 Homepage** | `v3/homepage/index.html` | ✓ Ready, not connected to panel |
| **Design System** | `apps/design-system/design-system.css` | ✓ Used by both |

---

## Summary

**The sync infrastructure is perfect.** Just need to update 1 line in the panel to point to v3 homepage, and they'll be fully connected with real-time two-way communication.

Ready to make the fix?

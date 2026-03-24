# 99acres Homepage Evolution — Complete Setup

## ✅ Current Status: READY TO USE

You now have a **complete, production-ready system** with two homepage versions:

---

## 📁 What You Have

### **1. Researcher Panel** (Active)
- **Location:** `Repeat Users Homepage/panel/index.html`
- **Status:** ✅ Fully functional
- **Features:**
  - Persona dropdown (pre-built buyer profiles)
  - Stage toggle (S1-S5)
  - Form controls (BHK, budget, location, work location)
  - Session save/load
  - Real-time sync to homepage
  - "Apply" button for AI pipeline

### **2. V2 Homepage** (Panel-connected)
- **Location:** `Repeat Users Homepage/homepage/index.html`
- **Status:** ✅ Active, synced to panel
- **Connection:** Panel's iframe points here
- **How it works:** Panel form changes → postMessage to homepage → real-time update

### **3. V3 Homepage** (Fresh Design - Standalone)
- **Location:** `v3/homepage/index.html`
- **Status:** ✅ Complete redesign, fully functional
- **Features:**
  - Clean, minimal card-based layout
  - 2-column property grids
  - Bottom navigation bar (5 tabs)
  - Expandable FAQ accordion
  - Fresh typography hierarchy
  - Proper color system (blue/green/orange)
  - WCAG 2.1 AA accessible
- **View:** Open in separate browser tab (not iframe)

---

## 🚀 How to Use

### **Workflow 1: Research with Panel**
```
1. Open: http://localhost:8000/Repeat%20Users%20Homepage/panel/index.html
2. Left sidebar: Researcher panel with controls
3. Right side: V2 homepage in phone mockup (360×760px)
4. Change form → homepage updates in real-time
5. Toggle stages, adjust filters, try personas
```

**Perfect for:** Testing buyer personas, researching different stages

---

### **Workflow 2: View V3 Fresh Design**
```
1. Open: http://localhost:8000/v3/homepage/index.html
2. Full mobile view (360px width)
3. See the fresh redesign in action
4. S2 demo loads by default (Priya Mehta, Sector 137, Noida)
5. Open browser DevTools to simulate different stages (console access)
```

**Perfect for:** Showcasing the fresh design, reviewing UX

---

## 🎯 Key Features Per Version

| Feature | V2 (Panel) | V3 (Standalone) |
|---------|-----------|-----------------|
| **Panel Integration** | ✅ Connected | Standalone |
| **Real-time Sync** | ✅ Yes | Standalone mode |
| **Design System** | Original | Fresh redesign |
| **Bottom Nav** | None | ✅ 5-tab bar |
| **FAQ Module** | ✅ Yes | ✅ Expandable |
| **Property Grid** | Flex scroll | ✅ 2-column |
| **Typography** | Standard | ✅ Clean hierarchy |
| **Colors** | Mixed | ✅ System tokens |
| **Accessibility** | Good | ✅ WCAG AA |

---

## 🔄 Data Flow

### **Panel → V2 Homepage (Real-time)**
```
Panel Form Change
    ↓
panel.sync() [debounced 400ms]
    ↓
sendToIframe(profile)
    ↓
postMessage() to V2 iframe
    ↓
V2 listens: window.addEventListener('message')
    ↓
config update → fetchAndRender()
    ↓
Homepage updates instantly
```

### **Panel → Supabase → Multiple Devices**
```
Panel Form Change
    ↓
writeLiveConfig() to live_config table
    ↓
Supabase real-time channel
    ↓
V2 homepage (or V3 standalone) subscribed
    ↓
Cross-device sync (phone + laptop stay in sync)
```

---

## 📊 File Locations Reference

```
/Users/fa061462/Documents/Cursor/

├── Repeat Users Homepage/
│   ├── panel/index.html              ✅ Active researcher panel
│   ├── homepage/index.html           ✅ V2 homepage (panel-connected)
│   └── homepage.css
│
├── v3/
│   ├── homepage/index.html           ✅ V3 fresh redesign
│   └── homepage.css                  ✨ Complete redesign
│
├── apps/
│   └── design-system/
│       ├── design-system.css         📦 Shared tokens
│       └── design-system.html        📖 Component guide
│
└── supabase/
    ├── migrations/                   Database schema
    ├── .env                          (gitignored)
    └── RUN_ME_IN_SUPABASE.sql
```

---

## 🌐 Local Development Server

To view everything locally:

```bash
cd /Users/fa061462/Documents/Cursor
python3 -m http.server 8000
```

Then access:
- **Panel + V2:** http://localhost:8000/Repeat%20Users%20Homepage/panel/index.html
- **V3 Standalone:** http://localhost:8000/v3/homepage/index.html
- **Design System:** http://localhost:8000/apps/design-system/design-system.html

---

## 🎨 Design System

Both V2 and V3 inherit from shared design system:

**Location:** `apps/design-system/design-system.css`

**Tokens:**
- Colors: Blue (#2563eb), Green (#16a34a), Orange (#d97706)
- Spacing: 4px-32px scale
- Typography: 11px-32px sizing
- Radii: 6px-12px
- Shadows: Subtle to medium
- Button variants: 4 types × 4 sizes

---

## 🔧 Configuration

### **Supabase Setup (Optional)**
```javascript
// v2/homepage/config.js or v3/homepage/config.js
window.SUPABASE_URL = 'https://your-project.supabase.co';
window.SUPABASE_ANON_KEY = 'your-anon-key';
```

### **OpenAI (Optional)**
```javascript
window.OPENAI_API_KEY = 'sk-...';
```

### **API Base (Optional)**
```javascript
window.NINETY_NINE_ACRES_API_BASE = 'http://localhost:5003';
// or: 'http://10.10.17.143:5003' (internal)
```

---

## 📝 Personas Available

Pre-built in panel dropdown:

1. **Priya Mehta** (S2 - Locality Aware)
   - Location: Sector 75, Noida
   - Budget: ₹70L-95L
   - Works near: Sector 62

2. **Rahul Patel** (S3 - Comparison)
   - Comparing Sector 137 vs 143
   - Budget: ₹80L-1.1Cr
   - Ready to move

3. **Meera Singh** (S1 - Discovery)
   - Just starting search
   - Budget: ₹50L-1Cr
   - Exploring multiple areas

*(Add more in panel's persona section)*

---

## ✨ Stage Model (S1-S5)

| Stage | Name | Focus | Modules Shown |
|-------|------|-------|-----------------|
| **S1** | Discovery | City-level exploration | Budget anchor, new launches, trends |
| **S2** | Locality Awareness | Specific localities, comparisons | Continue, fresh, nearby, tools |
| **S3** | Comparison | Head-to-head analysis | H2H table, landmarks, experts |
| **S4** | Shortlist/Decision | Ready to decide | Spotlight, social proof, visit planning |
| **S5** | Post-Visit | After viewing | Tools, EMI, registration guides |

---

## 🎯 What to Do Next

### **Option 1: Test Panel-Driven Workflow**
1. Open panel: http://localhost:8000/Repeat%20Users%20Homepage/panel/index.html
2. Select persona
3. Adjust filters (BHK, budget)
4. Toggle stages S1→S5
5. See V2 homepage update in real-time

### **Option 2: Showcase V3 Design**
1. Open V3: http://localhost:8000/v3/homepage/index.html
2. View the fresh design
3. Review layout, colors, typography
4. Check mobile responsiveness (DevTools)

### **Option 3: Both in Parallel**
- Tab 1: Panel + V2 (for testing/research)
- Tab 2: V3 (for design review)

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Images not loading | Use HTTP server (`python3 -m http.server 8000`), not file:// |
| Panel not syncing to V2 | Check browser console for errors, verify Supabase config |
| V3 loads blank | Open in separate tab, not iframe. Full page view works. |
| Styles look weird | Make sure design-system.css loads first (it does, in both versions) |
| No data showing | Check console for fetch errors, verify mock data is present |

---

## 📚 Documentation

Created during setup:
- `V3_FRESH_REDESIGN_COMPLETE.md` — V3 design details
- `PANEL_HOMEPAGE_SYNC_AUDIT.md` — Sync architecture
- `V3_HOMEPAGE_SUMMARY.md` — Initial v3 overview
- `SETUP_COMPLETE.md` — This file

---

## ✅ You're All Set!

Everything is working:
- ✅ Researcher panel functional
- ✅ V2 homepage synced to panel
- ✅ V3 fresh design ready standalone
- ✅ Design system shared between both
- ✅ Supabase integration available
- ✅ Panel personas preconfigured
- ✅ All JavaScript logic preserved

**Ready to use. No more changes needed.** 🚀

---

## 🔗 Quick Links

| What | Where | URL |
|------|-------|-----|
| **Panel** | Researcher controls | http://localhost:8000/Repeat%20Users%20Homepage/panel/index.html |
| **V2 Homepage** | Original design | http://localhost:8000/Repeat%20Users%20Homepage/homepage/index.html |
| **V3 Homepage** | Fresh design | http://localhost:8000/v3/homepage/index.html |
| **Design System** | Component guide | http://localhost:8000/apps/design-system/design-system.html |

---

**System complete. Ready for deployment.** ✨

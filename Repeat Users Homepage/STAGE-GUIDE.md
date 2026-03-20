# 99acres Repeat User Homepage — Researcher Stage Guide

This guide helps researchers understand the buyer journey stages and select the right persona to test each stage.

---

## **Buyer Journey Stages (S1–S5)**

### **S1: Discovery** *(Not implemented — Future)*
- **User Signal:** "Just exploring, no specific locality in mind"
- **Behavior:** City-level search, browsing new launches, no saves yet
- **Focus:** Budget anchoring, new projects, trend overview
- **Modules:** Budget anchor, new launches, price trends
- **Persona:** None (reserved for future)

---

### **S2: Locality Awareness** ⭐ *Active — 2 Personas*
- **User Signal:** "I've found a locality I like; exploring options there"
- **Behavior:** 2–4 visits, specific locality focus, 0–2 property saves, checking commute
- **Focus:** Locality deep-dive, properties, similar options, BHK confirmation
- **Key Modules:** Continue, Localities Radar, Consideration Set, Nearby Localities, Similar BHK, Preference Confirmation
- **Commute Feature:** ✅ Shown (worksNear available)
- **Section Count:** 7 modules

#### **S2 Personas:**

| Name | Key Characteristic | Budget | Location | worksNear | BHK | Last Visit | Journey Type |
|------|-------------------|--------|----------|-----------|-----|------------|--------------|
| **s2_locality_explorer** | First-time buyer, exploring localities | ₹70–95L | Sector 137 | Sector 62 | 2BHK | 3 days ago | Broad discovery with open mindset |
| **s2_locality_focused** | Returning buyer, focused deep-dive | ₹75–90L | Sector 137 | Sector 62 | 2BHK | 5 days ago | Single locality expertise |

**Test this stage for:** Commute-aware browsing, locality suggestions, BHK preferences, simple property cards

---

### **S3: Comparison** ⭐ *Active — 2 Personas*
- **User Signal:** "I'm comparing 2 localities; help me decide"
- **Behavior:** 2 localities set, filters used, 2–4 saves, visiting both areas
- **Focus:** Head-to-head comparison, landmarks, investment vs lifestyle trade-offs
- **Key Modules:** Continue, Head-to-Head Comparison, Landmarks, Expert Sellers, Upcoming Developments, Nearby Localities
- **Commute Feature:** ❌ Not shown (no worksNear data for these personas)
- **Section Count:** 6 modules

#### **S3 Personas:**

| Name | Key Characteristic | Budget | Location | worksNear | BHK | Last Visit | Journey Type |
|------|-------------------|--------|----------|-----------|-----|------------|--------------|
| **s3_budget_comparison** | Budget-constrained, finding value | ₹50–60L | Noida (city-level) | — | 2BHK | 7 days ago | Affordable options across zones |
| **s3_investment_focus** | Investor mindset, appreciation-focused | ₹100–150L | Noida (city-level) | — | 2–3BHK | 2 days ago | Investment returns & growth potential |

**Test this stage for:** H2H comparisons, landmark insights, tradeoff analysis, rich property cards with engagement

---

### **S4: Shortlist/Decision** ⭐ *Active — 1 Persona*
- **User Signal:** "I've decided which property; help me complete the purchase"
- **Behavior:** Same property viewed repeatedly, contacted developer, ready to visit
- **Focus:** Decision confirmation, social proof, site visit planning, financing
- **Key Modules:** Decision Spotlight, Social Proof, Still Considering, Visit Planning, Tools
- **Commute Feature:** ✅ Shown (worksNear available)
- **Section Count:** 5 modules

#### **S4 Personas:**

| Name | Key Characteristic | Budget | Location | worksNear | BHK | Last Visit | Journey Type |
|------|-------------------|--------|----------|-----------|-----|------------|--------------|
| **s4_property_upgrader** | Existing owner upgrading 2→3BHK | ₹120–150L | Sector 137 | Sector 62 | 3BHK | 1 day ago | Move-up purchase |

**Test this stage for:** Decision confirmation, shortlist management, commute validation, final CTA

---

### **S5: Post-Visit** *(Not implemented — Future)*
- **User Signal:** "I visited the property; now I'm negotiating or finalizing"
- **Behavior:** Site visit completed, negotiating terms, ready for documentation
- **Focus:** Possession timeline, financing tools, registration costs
- **Modules:** Post-visit tools (EMI, loans, registration), feedback, still considering
- **Persona:** None (reserved for future)

---

## **Persona Selector Reference**

When you load a persona in the panel, you'll see this in the dropdown:

```
── STAGE 2: LOCALITY AWARENESS ────
  s2_locality_explorer    | Budget: ₹70–95L | Sector 137
  s2_locality_focused     | Budget: ₹75–90L | Sector 137
── STAGE 3: COMPARISON ────────────
  s3_budget_comparison    | Budget: ₹50–60L | Noida (city)
  s3_investment_focus     | Budget: ₹100–150L | Noida (city)
── STAGE 4: DECISION ──────────────
  s4_property_upgrader    | Budget: ₹120–150L | Sector 137
```

---

## **Module Visibility Matrix**

Which modules appear in each stage:

| Module | S2 | S3 | S4 | Notes |
|--------|----|----|----|----|
| **Continue Where You Left Off** | ✅ Simple | ✅ Rich | ✅ Rich | Shows recently viewed properties |
| **Localities on Your Radar** | ✅ | ✅ | ❌ | Top localities they've viewed |
| **Consideration Set** | ✅ | ✅ | ❌ | What matters: metro/schools/lifestyle |
| **Fresh Listings** | ✅ | ✅ | ❌ | New properties sorted by commute (if worksNear) |
| **Nearby Localities** | ✅ | ✅ | ❌ | Alternative zones with savings |
| **Budget Check** | ✅ | ❌ | ❌ | "Open to ₹80–1 Cr?" confirmation |
| **Similar BHK** | ✅ | ❌ | ❌ | "3 BHK similar to what you viewed" |
| **Preference Confirmation** | ✅ | ❌ | ❌ | "Continue viewing 3BHKs?" |
| **Head-to-Head Comparison** | ❌ | ✅ | ❌ | Sector 137 vs Sector 143 (price, commute, YoY, landmarks) |
| **Landmarks** | ❌ | ✅ | ❌ | Metro, Hospital, School, Market distances |
| **Expert Agents** | ❌ | ✅ | ❌ | Top sellers/brokers in area |
| **Upcoming Developments** | ❌ | ✅ | ✅ | New projects launching |
| **Decision Spotlight** | ❌ | ❌ | ✅ | "Your Top Pick" with full details |
| **Social Proof** | ❌ | ❌ | ✅ | "X people contacted this week" |
| **Still Considering** | ❌ | ❌ | ✅ | Other shortlisted properties |
| **Visit Planning** | ❌ | ❌ | ✅ | Site visit scheduler |
| **Price Trend** | ✅ | ✅ | ✅ | YoY appreciation in locality |
| **Articles & Tools** | ✅ | ✅ | ✅ | Educational content + calculators |

---

## **Commute Feature Testing**

**Personas with worksNear (commute displays):**
- ✅ **s2_locality_explorer** (Sector 62)
- ✅ **s2_locality_focused** (Sector 62)
- ✅ **s4_property_upgrader** (Sector 62)

**To test commute features:**
1. Load s2_locality_explorer
2. Scroll to "Fresh Listings" — properties sorted by commute to Sector 62
3. Check property cards show "27 mins to Sector 62" (for nearby sectors)
4. Load s4_property_upgrader
5. Check Decision Spotlight shows "27 mins to Sector 62"

**Personas without worksNear:**
- ❌ **s3_budget_comparison** (no office specified)
- ❌ **s3_investment_focus** (no office specified)

---

## **Quick Testing Checklist**

### **To verify S2 flow works:**
```
[ ] Load s2_locality_explorer
[ ] See "Continue Where You Left Off" (simple 2-column cards)
[ ] See "Localities on Your Radar"
[ ] See "Which matters most?" (Metro, Hospital, School, Market)
[ ] See commute times on property cards
[ ] See "Nearby Localities" section
[ ] See "Do you want to continue viewing 3BHKs?"
```

### **To verify S3 flow works:**
```
[ ] Load s3_budget_comparison
[ ] See "Continue Where You Left Off" (rich cards with engagement)
[ ] See "Head-to-Head" comparison table
[ ] See "Nearest Landmarks" (Metro, Hospital, School, Market)
[ ] See "Expert Agents" section
[ ] See "Upcoming Developments"
```

### **To verify S4 flow works:**
```
[ ] Load s4_property_upgrader
[ ] See "Decision Spotlight" (top pick details)
[ ] See "Social Proof" (X people contacted)
[ ] See "Still Considering" (other shortlisted properties)
[ ] See commute time to office
```

---

## **Persona Attributes Reference**

All personas use these fields:

```js
{
  user: {
    name: "Full Name",
    age: 30,
    occupation: "Job Title",
    worksNear: "Sector 62" // or null
  },
  lastVisitDaysAgo: 3,
  location: {
    primary: "Sector 137",    // Main locality
    secondary: null,          // Second locality (S3 only)
    openToNearby: true        // Willing to explore alternatives
  },
  filters: {
    budgetMin: 70,            // in Lakhs
    budgetMax: 95,            // in Lakhs
    bhk: ["2BHK"],            // Array: ["2BHK"], ["3BHK"], or ["2BHK", "3BHK"]
    readyToMove: "either",    // "yes", "no", or "either"
    buyTimeline: "exploring"  // "exploring", "3m", "6m", "6m+"
  },
  behavior: {
    developerContact: "none",    // "none", "callback", "visited"
    visitedSite: false,          // Has user visited the property?
    priceSensitivity: "medium"   // "low", "medium", "high"
  },
  stageOverride: 2              // Force specific stage (1-5)
}
```

---

## **Notes for Researchers**

1. **Reload personas:** Each time you select a persona from dropdown, the homepage resets to show that journey stage
2. **Commute calculations:** Commute times are estimated based on sector proximity — not real traffic data
3. **Mock data:** All properties shown are from mock dataset (not live 99acres API)
4. **Shortlisting:** Heart icons on cards allow marking favorites, but data isn't persisted
5. **Real-time sync:** If you open the homepage on another device/tab, changes sync via Supabase `live_config` table

---

## **Future Stages**

### **S1: Discovery** (Placeholder)
- For testing initial entry point, budget anchoring, new launches
- Could use persona like "s1_first_timer" with city-level search

### **S5: Post-Visit** (Placeholder)
- For testing post-visit tools, financing options, negotiation support
- Could use persona like "s5_final_decision" with ready-to-close behavior

---

**Last Updated:** 2026-03-20
**Version:** 1.0

# 99acres Homepage Evolution Framework
### Repeat User Experience — Adaptive Homepage by Buyer Stage

---

## Overview

The homepage is not static. It mirrors where the buyer is in their journey — from vague city-level curiosity to a confident decision-maker standing at the threshold of a site visit. Every return to the platform is an opportunity to reduce friction and move the buyer one step forward.

> **Scope**: This document covers the **repeat user homepage** — users who have at least one prior session on the platform. Stage 1 here represents a user returning after a dormant period, not a literal first-ever visit. First-time user onboarding is a separate experience.

> **Note on examples**: All location examples in this document use Noida, Sector 137, and Sector 143 as illustrative placeholders. The system and all modules described here should work identically for any city and locality set (Gurgaon, Bengaluru, Mumbai, etc.). Re-engagement triggers (push notifications, email digests, price drop alerts) are what bring repeat users back to see the updated homepage — the experience documented here assumes the user has already returned.

This document defines:
1. The five stages of a real estate buyer's journey
2. What triggers each stage transition
3. How each homepage module evolves per stage
4. Edge cases and alternate buyer personas
5. Backend researcher platform specification

---

## Part 1: The Five Stages of the Buyer Journey

```
Stage 1          Stage 2          Stage 3          Stage 4          Stage 5
DISCOVERY   →   LOCALITY     →  COMPARISON   →   SHORTLIST    →   POST-VISIT
(Exploring)     AWARENESS        (Evaluating)     (Deciding)       (Confirming)
                (Narrowing)
```

### Stage 1 — Discovery
**Who**: First-time or very early visitor. Searching at city level (e.g., "Noida", "Gurgaon").
**Signals**:
- Search query is at city/zone level, not locality
- No browsing history of specific projects
- No saved properties
- Budget/BHK not established

**Trigger to next stage**: User starts clicking into locality-level pages or property cards within a locality.

---

### Stage 2 — Locality Awareness
**Who**: User has visited the platform 2–4 times. Has browsed a couple of sectors/localities. Has some sense of BHK and budget but hasn't compared localities formally.
**Signals**:
- Searched with locality-level filters (e.g., "Sector 137", "Sector 70")
- Has viewed 3–5 property cards
- Has an implicit budget range (inferred from properties clicked)
- May have 1 saved property

**Trigger to next stage**: User shortlists 2+ localities or saves 2+ properties.

---

### Stage 3 — Comparison
**Who**: User has identified 2–3 localities they're seriously considering. Actively comparing price per sqft, amenities, connectivity.
**Signals**:
- Consistent searches across 2–3 specific localities
- Has used filter refinements (BHK, budget ceiling)
- Has 2–4 saved properties across localities
- Has used comparison feature or viewed locality guide pages

**Trigger to next stage**: User contacts a developer/broker or views a property 5+ times.

---

### Stage 4 — Shortlist / Decision
**Who**: Has a shortlist of 3–5 specific properties. Viewing the same listings repeatedly. Price-sensitive. May have contacted a developer.
**Signals**:
- Same property viewed 5+ times
- Has called/contacted at least one developer
- Has compared 2+ properties head-to-head
- Recent price drop notifications checked

**Trigger to next stage**: User has visited a property in person (marked via visit confirmation, or inferred from CTA interaction).

---

### Stage 5 — Post-Visit
**Who**: Has done at least one site visit. Now evaluating financeability, practicalities (parking, possession timeline, society rules).
**Signals**:
- Clicked "Visit this weekend" CTA
- Has confirmed or provided feedback about a visit
- Viewed EMI calculators / home loan pages
- Engaged with "What's working / not working" feedback prompts

**Trigger to exit/conversion**: Contacted developer again post-visit, or marked as "purchased" externally.

---

## Part 2: Homepage Module-by-Module Evolution

### Module 1: Search Bar + Context Chips

| Stage | Chip Content | Behavior |
|-------|-------------|----------|
| Stage 1 | Empty or "Buy in Noida" | Open search, generic |
| Stage 2 | "Buy in Noida × " + "Sec 137 · 2BHK ×" | Shows last search context as pills |
| Stage 3 | "Sec 137 · Under 95L ×" + "Sec 143 · 2BHK ×" | Multi-locality context, budget chip |
| Stage 4 | "Sec 137 · 2BHK · Under 95L ×" + "Sec 143 · 2BHK ×" | Locked context, budget ceiling visible |
| Stage 5 | Same as Stage 4 | Persistent, no change unless user edits |

---

### Module 2: Hero / Above-the-fold

| Stage | Content |
|-------|---------|
| Stage 1 | Generic search prompt. "Find your home in Noida." + Trending localities banner |
| Stage 2 | "Continue Where You Left Off" — 2 recently viewed property cards |
| Stage 3 | "Continue Where You Left Off" — 2 cards + "How are your browsed sectors?" prompt |
| Stage 4 | **DECISION SPOTLIGHT** — Most viewed property, viewed count, contact status, price change since last visit, urgency signal (units left, people contacted this week) |
| Stage 5 | Post-visit property card with "What's working / not working for you?" feedback prompt + visit notes area |

---

### Module 3: Locality Intelligence

| Stage | Content |
|-------|---------|
| Stage 1 | Trending localities in Noida. Top 6 areas by search volume |
| Stage 2 | "Localities on your radar" — Sector 137 + Sector 70 cards. Key stats (avg price, connectivity, nearby employers). Interactive preference prompt: Metro / Schools / Marketplace |
| Stage 3 | **Sector 137 vs Sector 143 comparison table**: Area, Avg price/sqft, RTM availability, Developer reputation, Metro connectivity, Schools, Society type. + "Which matters more to you?" selector. **Consideration Set prompt**: "What is your consideration set?" — user explicitly confirms or edits the 2–3 localities they're comparing. Once confirmed, the comparison table locks to those localities and stops surfacing new ones. |
| Stage 4 | Locality context collapsed — only visible as chip. Spotlight on property, not locality |
| Stage 5 | Locality-level appreciation data for the visited property's sector |

---

### Module 4: Property Cards Feed

| Stage | Content |
|-------|---------|
| Stage 1 | Trending properties in Noida. No personalisation. BHK and budget unknown — sorted by search volume |
| Stage 2 | Properties in browsed sectors. Labelled "New" / "Price Drop". Budget-range inferred |
| Stage 3 | Properties in Sector 137 AND Sector 143. Side-by-side presentation. Budget ceiling filter applied |
| Stage 4 | "Your other shortlisted properties" — shortlist management view. Price drops called out. "Did your friend like the property?" social proof nudge. "Still in the running? Yes / No" prompt |
| Stage 5 | Properties user viewed post-visit. Similar properties at slightly higher/lower budget with delta shown ("₹2L more · 40 extra sqft") |

---

### Module 5: Budget & BHK Nudges

| Stage | Content |
|-------|---------|
| Stage 1 | Not shown |
| Stage 2 | "Open to new properties in ₹90L–1.1Cr or do you have a specific budget?" — range selector |
| Stage 3 | Budget range confirmed. "Do you want to continue seeing 2BHKs?" — Yes/No prompt |
| Stage 4 | Budget locked. "₹2L since last visit" on property card (price movement surfaced) |
| Stage 5 | EMI calculator surfaced. "At ₹86L, your EMI would be ₹68K/mo" |

---

### Module 6: Nearby / Adjacent Locality Discovery

| Stage | Content |
|-------|---------|
| Stage 1 | Not shown |
| Stage 2 | "Nearby localities · ₹9L below Sector 137" — Godrej Properties Sector K, Prateek Edifice Sector L |
| Stage 3 | Same module with comparison context: "Similar to Sector 143 but ₹7L cheaper" |
| Stage 4 | Not shown (user is in decision mode, not discovery) |
| Stage 5 | Not shown |

---

### Module 7: Social Proof & Urgency

| Stage | Content |
|-------|---------|
| Stage 1 | "X families moved to Noida this month" |
| Stage 2 | "2BHK similar to what you viewed on Tuesday" + recency anchor |
| Stage 3 | "12 people are also looking at Sector 137 vs 143 this week" |
| Stage 4 | "🔥 12 people contacted this week" on Decision Spotlight. "3 units left". "₹2L drop since last visit" |
| Stage 5 | "You've opened this 7 times. Your instinct is telling you something." |

---

### Module 8: Upcoming/New Launches

| Stage | Content |
|-------|---------|
| Stage 1 | New launches in Noida broadly |
| Stage 2 | New launches in browsed sectors |
| Stage 3 | "Upcoming Projects in Sector 137" + "Upcoming in Sector 143" |
| Stage 4 | Hidden (not relevant when user is in decision mode) |
| Stage 5 | Hidden |

---

### Module 9: Tools & Calculators

| Stage | Content |
|-------|---------|
| Stage 1 | Hidden |
| Stage 2 | Lightly surfaced: "Price Trends", "Buyer Guide" |
| Stage 3 | Full tools strip: Price Trends, EMI Calculator, Home Loan Guide, Buyer Guide, Rent vs Buy, Invest |
| Stage 4 | EMI Calculator, Home Loan Calculator, Price Check tool |
| Stage 5 | Home Loan Calculator prominently surfaced. Registration guide |

---

### Module 10: CTA Anchors

| Stage | Primary CTA | Secondary CTA |
|-------|------------|---------------|
| Stage 1 | "Search properties in Noida" | "Explore localities" |
| Stage 2 | "See all in Sector 137" | "Explore nearby" |
| Stage 3 | "Find the home that feels right for you" | "Compare Sector 137 vs 143" |
| Stage 4 | "Visit this weekend" | "Plan Weekend Visits (7-8th March)" |
| Stage 5 | "Confirm your visit" / "Book again" | "Talk to a loan advisor" |

---

### Module 11: Articles & Guides

Seen in Stage 2 and Stage 3 wireframes. A horizontal scroll strip of editorial content surfaced at the bottom of the homepage. Content becomes increasingly locality-specific as the user progresses.

| Stage | Content |
|-------|---------|
| Stage 1 | Hidden |
| Stage 2 | Generic real estate guidance: "When is the right time to buy?", "How to read a RERA certificate", "Home loan eligibility explained" |
| Stage 3 | Locality-specific content: "Why buyers prefer Sector 137", "Price trends in Sector 143 — 2024 vs 2025", "Noida Expressway vs FNG Corridor" |
| Stage 4 | Deal-readiness content: "What to check before a site visit", "How to negotiate with a developer", "Understanding the sale deed" |
| Stage 5 | Post-visit / legal content: "Home loan process — step by step", "Stamp duty and registration in UP", "Tax benefits on home loans" |

---

## Part 3: Alternate Buyer Personas

### Persona A — Priya (Broad City Entry)
**Profile**: 32, Product Manager, Sector 62 office, ₹88L budget
**Entry**: Searched "Noida" on first return visit. No specific locality in mind.

**Journey arc:**

| Visit | What she did | Stage |
|-------|-------------|-------|
| Visit 1 | Searched "Noida", browsed 4–5 property cards in Sector 137 and Sector 70 | Stage 1 → 2 |
| Visit 2 (3 days later) | Homepage shows "Localities on your radar: Sec 137, Sec 70". Clicks into Sector 143 from the nearby localities module | Stage 2 |
| Visit 3 | Saves 2 properties in Sector 137. Clicks Sector 143 listings twice | Stage 2 → 3 |
| Visit 4 | Homepage surfaces Sec 137 vs Sec 143 comparison table. She confirms her consideration set | Stage 3 |
| Visit 5 | Opens Godrej Sector 137 five times in one session. Homepage nudges toward Decision Spotlight | Stage 3 → 4 |
| Visit 6 (10 days later) | Decision Spotlight: Godrej Sector 137. "Viewed 7×. ₹2L drop since last visit." Books a site visit | Stage 4 |
| Visit 7 (post-visit) | "What's working / not working?" feedback prompt. EMI calculator surfaced | Stage 5 |

**Key insight**: Priya never explicitly searched Sector 143 — the adjacent locality module introduced it. The homepage did the locality education so she didn't have to.

---

### Persona B — Rahul (Specific Locality Entry, Narrow Knowledge)
**Profile**: 34, Software Engineer, works in Sector 62. Only knows Sector 137 (friend lives there). Has ₹85L budget.
**Entry**: Searches "Sector 137" directly on first visit.

**Key challenge**: He doesn't know what he doesn't know. Sector 128 or Sector 150 might suit him better — lower price, better greenery — but he won't search for them.

**Homepage adjustments**:

| Stage | Adaptation |
|-------|-----------|
| Stage 1 | Since he landed at locality level (not city), skip generic city content. Show "You searched Sector 137 — here's what's around it" immediately. Surface max 2 adjacent localities with value callout. No broad "Noida" framing. |
| Stage 2 | "Localities on your radar: Sector 137 · Sector 128 (₹9L cheaper)". Frame adjacent options as natural extensions, not replacements. Budget and BHK inferred from clicked listings. |
| Stage 3 | If he starts clicking Sector 128 links, upgrade to Comparison stage between Sec 137 and Sec 128. Do not force-show Sector 143 — outside his discovery path. |
| Stage 4 | Decision Spotlight on whichever specific project he viewed most, regardless of locality. |

**Risk**: Don't over-suggest. Showing too many unknown localities to someone who only knows one can create confusion and kill intent. Surface at most 2 adjacent options at a time.

---

### Persona C — Meera (Budget-Constrained, Range Pressure)
**Profile**: 29, Teacher, ₹60L max. Looking in Noida. Searches like "2BHK under 60L Noida" show limited results.

**Homepage adjustments**:

| Stage | Adaptation |
|-------|-----------|
| Stage 1/2 | Budget mismatch signal: "2BHK inventory in Noida under ₹60L is limited. Here are sectors where it exists: Sector 73, Sector 76, Greater Noida West." |
| Stage 2 | Show "Budget-friendly zones" module instead of generic locality radar. Map affordability index per locality. |
| Stage 3 | Compare two affordable localities, not premium ones. Frame around "price per sqft" advantage. |
| Stage 4 | Decision module similar to Stage 4 above, but price drop signals are more prominent |
| Stage 5 | Loan eligibility calculator front and center. Show "₹60L → eligible for X loan at Y income" |

---

### Persona D — Vikram (Investor Mindset)
**Profile**: 45, owns a home, buying as investment. Searches "2BHK Noida for investment", looks at yield data and price appreciation.

**Homepage adjustments**:

| Stage | Adaptation |
|-------|-----------|
| Stage 1 | Show "Top appreciating localities in Noida" instead of livability content. Lead with YoY% data. |
| Stage 2 | Highlight "+18% YoY · highest rise in Noida", "+22% YoY" data in property cards |
| Stage 3 | Locality comparison framed as investment lens: rental yield, appreciation rate, developer track record |
| Stage 4 | Decision Spotlight includes investment signals: rental demand, possession timeline, resale liquidity |

---

### Persona E — The Upgrader (Already Owns a Flat)
**Profile**: 38, owns a 2BHK in Sector 62, wants a 3BHK. Has budget from existing property sale.

**Homepage adjustments**:
- Search context chips include "3BHK" prominently
- Surface "What's available near your current home" — short commute radius
- Comparison module includes floor plan size upgrade angle (sqft gain over current home)
- Tools module surfaces "Sell your current home" and "Tax benefit on reinvestment"

---

## Part 4: Edge Cases & Rules

### Rule 1: Stage Regression
If a user returns after 30+ days of inactivity, do not assume they're at the same stage. Surface a soft reset:
> "It's been a while. Want to pick up where you left off or start fresh?"

### Rule 2: Stage Acceleration
Some users move fast. If someone contacts a developer on their 2nd visit, jump directly to Stage 4 content. Don't force-serve Stage 2/3 modules they'll ignore.

### Rule 3: Locality Expansion vs. Locality Lock
- Stages 1–2: Always surface 1-2 adjacent localities to expand consideration set
- Stage 3: Lock to the comparison pair the user has settled on. Don't introduce new localities.
- Stage 4+: No new locality introduction. User is in execution mode.

### Rule 4: Budget Anchoring
Once a budget range is confirmed (explicitly or from click behavior), do not show properties significantly above it without a clear label ("Slightly above your range — worth it?").

### Rule 5: Social Proof Escalation
- Stage 1: General city-level social proof
- Stage 2–3: Locality-specific activity signals
- Stage 4: Property-specific urgency (units left, recent contacts)
- Stage 5: Peer-level validation ("You've viewed this 7 times")

### Rule 6: Location Pivot
If a user who was tracking Noida starts a session with a search in a different city (e.g., Gurgaon), do not mix the two city contexts. Surface a soft reset prompt:
> "Looks like you're exploring Gurgaon — want to start fresh here, or keep your Noida shortlist too?"
If the user confirms the pivot, archive the Noida session and rebuild the homepage around Gurgaon data from Stage 1.

### Rule 7: Price Change Alert on Return
If a user in Stage 3 or Stage 4 returns after 14+ days, surface a brief alert module above the fold:
> "Since your last visit: Sector 137 avg price up Rs.200/sqft · Sector 143 unchanged"
This prevents decisions based on stale price expectations and rebuilds trust in data freshness.

---

## Part 5: Backend Researcher Control Panel — Specification

### Purpose
A web-based internal tool that allows UX researchers to simulate any buyer profile and stage, and instantly preview how the 99acres homepage would render for that user — for use in usability testing sessions.

---

### Platform Architecture

```
[Researcher Dashboard]
        ↓
[User Profile Config]  →  [Preview Engine]  →  [Homepage Mock]
        ↓
[Parameter Store (JSON)]
```

---

### Researcher Dashboard — Controls

#### Section 1: User Identity
| Field | Type | Options |
|-------|------|---------|
| Name | Text | Free text (e.g., "Priya Mehta") |
| Age | Number | — |
| Occupation | Text | Free text |
| Works near | Text | Locality (e.g., "Sector 62") |

#### Section 2: Buyer Stage
| Field | Type | Options |
|-------|------|---------|
| Current Stage | Dropdown | Stage 1 (Discovery) / Stage 2 (Locality Awareness) / Stage 3 (Comparison) / Stage 4 (Shortlist) / Stage 5 (Post-Visit) |
| Last visit (days ago) | Number | 0–90 days |

#### Section 3: Location — The Homepage Driver

**This is the most important control in the dashboard.** When the researcher types a location name, every content block on the homepage re-renders to reflect that location. Location is not just a search filter — it is the data context for the entire page.

| Field | Type | Description |
|-------|------|-------------|
| Primary Location | Text + Autocomplete | e.g., "Sector 137", "Noida", "Greater Noida West". Drives all content below. |
| Secondary Location | Text + Autocomplete | Optional. Unlocks comparison modules (Stage 3+). |

**What updates when location is entered:**

| Homepage Module | What Changes |
|----------------|-------------|
| Search chips | Pills reflect entered location name |
| Continue Where You Left Off | Property cards pulled from that location |
| Locality Radar cards | Stats for the entered locality: avg price/sqft, RTM availability, developer count, livability score |
| Locality Comparison Table | Entered location vs. secondary location — area, price/sqft, metro distance, schools, society type |
| Property Cards Feed | Listings filtered to that location, sorted by stage logic |
| Decision Spotlight | Most-viewed property within that location |
| Nearby / Adjacent Localities | Automatically inferred — localities within 3–5 km radius, shown with price delta |
| Upcoming Projects | New launches in that specific location |
| Connectivity Data | Landmarks relevant to that location (metro stations, tech parks, schools) |
| Social Proof Numbers | "X people contacted this week" scoped to that location |
| Price Trends | YoY appreciation % for that locality |
| Tools Strip | Price Trends and EMI calculator pre-seeded with that location's avg price |

**Researcher flow:**
1. Type "Sector 137" in Primary Location → entire homepage reflects Sector 137 data
2. Add "Sector 143" in Secondary Location → comparison table appears, property feed shows both
3. Change Primary to "Greater Noida West" → every module instantly re-renders for that location
4. No code changes needed — all content is driven by the location input

**Location data structure (per location entry):**
```json
{
  "location": {
    "primary": "Sector 137",
    "secondary": "Sector 143",
    "primaryMeta": {
      "avgPricePerSqft": 8021,
      "yoyAppreciation": 18,
      "rtmAvailability": "High",
      "metroDistance": "900m",
      "nearbyEmployers": ["Tech Mahindra", "Axis House"],
      "nearbySchools": ["DPS", "Amity"],
      "societyType": "Gated",
      "newLaunches": 3,
      "peopleContactedThisWeek": 12
    },
    "secondaryMeta": {
      "avgPricePerSqft": 9500,
      "yoyAppreciation": 12,
      "rtmAvailability": "Medium",
      "metroDistance": "1.2km",
      "nearbyEmployers": ["Logix Infra"],
      "nearbySchools": ["Ryan International"],
      "societyType": "Mixed",
      "newLaunches": 1,
      "peopleContactedThisWeek": 7
    },
    "adjacentLocalities": [
      { "name": "Sector 128", "priceDelta": -9, "label": "₹9L cheaper" },
      { "name": "Sector 150", "priceDelta": -4, "label": "Greenest belt" }
    ]
  }
}
```

#### Search Context (supporting filters)
| Field | Type | Options |
|-------|------|---------|
| Budget (min) | Number | ₹ in Lakhs |
| Budget (max) | Number | ₹ in Lakhs |
| BHK preference | Multi-select | 1BHK / 2BHK / 3BHK / 4BHK+ |
| Ready to move | Toggle | Yes / No / Either |

#### Section 4: Behavior Signals
| Field | Type | Description |
|-------|------|-------------|
| Saved properties | Tag input | Add property names/IDs |
| Most viewed property | Text | Property name + view count |
| Has contacted developer | Toggle | Yes / No |
| Has visited site | Toggle | Yes / No |
| Price sensitivity | Slider | Low → High (affects urgency module visibility) |

#### Section 5: Persona Shortcuts
Pre-set profiles the researcher can load in one click:
- Priya — Broad City Entry (Stage 2)
- Rahul — Specific Locality, Single Entry (Stage 2)
- Meera — Budget-Constrained (Stage 3)
- Vikram — Investor (Stage 3)
- Generic Stage 4 — Shortlist Ready
- Generic Stage 5 — Post-Visit

#### Section 6: Session Management
Researchers often need to simulate the same user across multiple visits to show how the homepage evolves over time.

| Control | Action |
|---------|--------|
| Save Session | Save current state with a name (e.g., "Priya_Visit1", "Priya_Visit3") |
| Load Session | Switch to any previously saved state — all parameters restore instantly |
| Duplicate Session | Clone current state as a new session to create a variant |
| Compare Sessions | Split-screen view of two saved sessions side by side — useful for showing progression to stakeholders |
| Session History | Timeline of all saved sessions for a profile, ordered chronologically |

#### Section 7: Reset Controls
| Control | Action |
|---------|--------|
| Reset to New User | Clears all parameters, sets Stage 1, removes all location and behavior data — blank slate |
| Undo Last Change | Reverts the last parameter change (single-step undo) |

---

### Homepage Preview Panel

- Renders the mobile homepage (360×800) in an iframe/phone mockup next to the control panel
- Updates in real-time (or on "Apply" click) as parameters change
- Toggle: **Show module labels** — overlays module names on the preview (for researcher reference)
- Toggle: **Highlight changed modules** — highlights which modules changed when stage was updated

---

### Technical Stack Recommendation

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | React + TailwindCSS | Fast prototyping, component-based |
| State management | Zustand or simple Context | Lightweight, no server sync needed |
| Homepage mock | Static HTML/CSS components mapped to stage config | Maintainable and researcher-editable |
| Config format | JSON profile files | Easy to save, load, share profiles |
| Backend (optional) | Node.js + Express | If researcher wants to save/share sessions |
| Hosting | Local or Vercel | Quick deployment for testing sessions |

---

### Example JSON Profile (Priya — Stage 2)

```json
{
  "user": {
    "name": "Priya Mehta",
    "age": 32,
    "occupation": "Product Manager",
    "worksNear": "Sector 62"
  },
  "stage": 2,
  "lastVisitDaysAgo": 3,
  "location": {
    "primary": "Sector 137",
    "secondary": null,
    "primaryMeta": {
      "avgPricePerSqft": 8021,
      "yoyAppreciation": 18,
      "rtmAvailability": "High",
      "metroDistance": "900m",
      "nearbyEmployers": ["Tech Mahindra", "Axis House"],
      "nearbySchools": ["DPS", "Amity"],
      "societyType": "Gated",
      "newLaunches": 3,
      "peopleContactedThisWeek": 12
    },
    "adjacentLocalities": [
      { "name": "Sector 128", "priceDelta": -9, "label": "Rs.9L cheaper" },
      { "name": "Sector 143", "priceDelta": 3, "label": "Premium corridor" }
    ]
  },
  "filters": {
    "budgetMin": 70,
    "budgetMax": 95,
    "bhk": ["2BHK"],
    "readyToMove": "either"
  },
  "behavior": {
    "savedProperties": ["ATS Tourmaline Tower A"],
    "mostViewedProperty": null,
    "viewCount": 0,
    "contactedDeveloper": false,
    "visitedSite": false
  }
}
```

---

### Researcher Workflow

1. Open dashboard → Load a persona preset or create custom profile
2. Set stage (1–5)
3. Adjust parameters (budget, localities, behavior signals)
4. Click **Preview** → see homepage mock update
5. Hand device/screen to research participant
6. During session: researcher can live-update parameters to simulate "what if they came back after shortlisting?"
7. Export session config as JSON for documentation

---

## Summary: Module Visibility Matrix

| Module | Stage 1 | Stage 2 | Stage 3 | Stage 4 | Stage 5 |
|--------|---------|---------|---------|---------|---------|
| Search + Chips | ✓ | ✓ | ✓ | ✓ | ✓ |
| Continue Where You Left Off | — | ✓ | ✓ | — | — |
| Decision Spotlight | — | — | — | ✓ | ✓ |
| Post-Visit Feedback | — | — | — | — | ✓ |
| Trending Localities | ✓ | — | — | — | — |
| Locality Radar | — | ✓ | — | — | — |
| Locality Comparison Table | — | — | ✓ | — | — |
| Property Cards Feed | ✓ | ✓ | ✓ | ✓ | ✓ |
| Shortlist Manager | — | — | — | ✓ | — |
| Budget Nudge | — | ✓ | ✓ | ✓ | — |
| BHK Confirmation | — | ✓ | ✓ | — | — |
| Nearby Adjacent Localities | — | ✓ | ✓ | — | — |
| Social Proof / Urgency | ✓ | ✓ | ✓ | ✓ | ✓ |
| New Launches | ✓ | ✓ | ✓ | — | — |
| Tools & Calculators | — | ◐ | ✓ | ✓ | ✓ |
| EMI / Loan Tools | — | — | — | ✓ | ✓ |
| Articles & Guides | — | ◐ | ✓ | ✓ | ✓ |

`✓` = Shown | `◐` = Partially shown | `—` = Hidden

**Note on Shortlist Manager**: The ability to save properties is available from Stage 2 onwards. The "Shortlist Manager" row marks Stage 4 only because that is when the homepage *prominently surfaces* the shortlist as a management interface (with Yes/No prompts, price drops, friend feedback). Saving itself is a persistent capability across all stages.

---

## Part 6: Implementation Summary — What Was Built on This Framework

This section documents what was implemented on top of the framework above (Parts 1–5 and the Module Visibility Matrix).

### Data flow (no researcher choice of source)

The researcher does not choose a data source. On **Apply** (and on every config push: iframe load, debounced form sync), the panel: (1) resolves location with OpenAI (city, primaryType, secondaryType) when `OPENAI_API_KEY` is set; (2) fetches localities and properties from OpenAI (`fetchRealDataWithOpenAI`) and attaches them to the profile as `openAIData`; (3) sends the full profile to the homepage via `postMessage` CONFIG_UPDATE. The homepage always tries 99acres first (`fetchPropertiesFrom99acres`, using `NINETY_NINE_ACRES_API_BASE` or a default base); if that returns no listings or fails, it uses `config.openAIData` (OpenAI-sourced localities and properties). Stage 1 localities use `config.openAIData.localities` when present.

### Researcher panel (vs Part 5 spec)

- **No "Data source" dropdown**; no `dataSource` in profile.
- **No explicit "Buyer Stage" dropdown.** Stage is **inferred** from: location openness (`openToNearby`), primary (and optional secondary when "Open to other/nearby localities" is on), budget/BHK filters, possession (ready to move), price sensitivity, buy timeline ("How soon do you want to buy?"), and behavior (contacted developer, visited site). Contact/visit combine with these signals; they do not override stage by themselves.
- **Location:** Primary location; **"Open to other / similar / nearby localities"** toggle; when on, an extra field for secondary/additional location is shown. No standalone "Secondary Location" without the toggle.
- **Filters:** Budget min/max, BHK, ready to move, and **buy timeline** (e.g. Within 1 month, 1–3 months, Just exploring).
- **Behavior:** Contacted developer, visited site, **price sensitivity** (low/medium/high). Removed: view count, most viewed property.
- Session management and persona shortcuts as in Part 5 (save/load/duplicate sessions, etc.).
- Preview iframe receives config on load and on debounced form changes; **Apply** runs full resolve + OpenAI fetch then sends config.

### Homepage

Stage-driven modules per Parts 1–2. Property listings: 99acres API first; OpenAI fallback when 99acres returns nothing or errors. Empty state copy: "No listings for this location yet. The app has tried 99acres and OpenAI." (No instruction for the researcher to set config or click Apply.)

### Config

Panel loads `config.js` (gitignored). Keys: `NINETY_NINE_ACRES_API_BASE` (99acres API base URL), `OPENAI_API_KEY` (location resolution and localities/properties fallback), Supabase for sessions. Default 99acres base is used in homepage when not set in config.

### Files

- Panel: `apps/panel/index.html`
- Homepage: `apps/homepage/index.html`
- Example config: `apps/panel/config.example.js`

---

*Document version 1.2 — implementation summary (Part 6) added.*
*Previous: 1.1 — based on wireframes: 3 visit.png (Stage 2), Evaluation.png (Stage 3), Comparison.png (Stage 4), Homepage/Priya (Stage 5). Revision: Added Articles module, Consideration Set feature, Location Pivot and Price Change Alert rules, Session Management, Reset controls, fixed JSON model, fixed Module 9 Stage 4, rewritten Persona A, cleaned Persona B, added scope and placeholder notes.*

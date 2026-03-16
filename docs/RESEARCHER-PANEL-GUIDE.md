# Researcher Panel — Guide

## 1. New (+), Save, Duplicate (for researchers)

| Action | What it does |
|--------|----------------|
| **+** (top) | **New session** — Clears the current form and starts a fresh, unsaved scenario. The + button is in the sidebar header. Nothing is written to the database. |
| **Save** | Saves the current form state to Supabase as a **session**. If you already loaded a session, this updates that session; otherwise it creates a new one. Use after you’ve set up a profile (or updated one) and want to keep it for later or for sharing. |
| **Duplicate** | Creates a **copy** of the current session (or the one you last loaded) as a new saved session. Use when you want a variant (e.g. “Priya Visit 3” and “Priya Visit 3 – budget change”) without re‑entering everything. |

**Opening a saved session:** Click any session in the “Saved sessions” list to load it into the form and apply it to the preview.

**Apply** pushes the current form values to the **preview only** (no save). Use it after changing fields to see the buyer homepage update.

---

## 2. Form layout from a lead researcher perspective

- **Top:** **+** in the sidebar header starts a new session; Save and Duplicate are in the “Saved sessions” block; **Apply** is in the sidebar footer.
- **Order of sections:** User identity → Location → Filters (budget/BHK) → **Behavior** (contacted, visited, view count, etc.) → **Buyer stage** (inferred from behavior; click to override) → Saved sessions list at the bottom.
- **Improvements made:** Apply is clearly separated; stage has short labels (1–5); saved sessions are at the end so the flow is “configure then pick a saved session.” On mobile, the same order is kept with a responsive layout.

---

## 3. What are Stage 1–5? (Repeat-user framing)

The doc defines the **repeat user** homepage: the buyer has at least one prior session. Stage 1 here is **not** “first-ever visit” but **“returning after a break / still exploring at city level.”**

| Stage | Name | Who (repeat user) | Typical signals |
|-------|------|-------------------|-----------------|
| **1** | Discovery | Back after a while; still searching at **city** level (e.g. “Noida”). No locality focus yet, no saved properties, budget/BHK not set. | City-level search, few or no project clicks, no saves. |
| **2** | Locality awareness | Has visited 2–4 times; browsing **localities** (e.g. Sector 137, 70). Some sense of budget/BHK, maybe 1 save. | Locality searches, 3–5 property views, 0–1 saved. |
| **3** | Comparison | Seriously comparing **2–3 localities**. Uses filters, has 2–4 saved properties, may use comparison tools. | Repeated locality searches, 2–4 saves, comparison usage. |
| **4** | Shortlist / decision | Shortlist of 3–5 properties; **same listings viewed repeatedly**; may have contacted a developer; price-sensitive. | 5+ views on same property, contact CTA used, price-drop checks. |
| **5** | Post-visit | Has done **at least one site visit**. Now about loan, possession, feedback. | Visit confirmation, EMI/loan pages, “What’s working / not working.” |

**Stage 1 in the panel:** “Returning user, still in discovery (city-level).” If the user has a locality set but low engagement, inferred stage can still be 2; you can override to 1 to simulate “locality-first” entry (e.g. “You searched Sector 137”) if the homepage supports that variant.

---

## 4. What is “Behavior”? How is stage inferred?

**Behavior** = signals that the **real** product would infer from clicks (saves, views, contact, visit, price sensitivity). In the panel they are **inputs** so you can simulate any combination.

**Stage is inferred from behavior** so researchers don’t have to guess stage from a first conversation. Rules: visited → 5; contacted (not visited) → 4; view count ≥5 → 3; view count ≥2 or primary location set → 2; else → 1. The panel updates stage automatically when you change behavior/location. You can **override** by clicking a stage (1–5); that fills typical defaults for that stage (view count, contacted, visited) so the form stays consistent.

- **Should it auto-update per stage?**  
  Yes, we can **pre-fill sensible defaults when you change stage** (e.g. Stage 4 → view count 5+, contacted = Yes), so the researcher doesn’t have to set every field. You can still override any value.

- **Is it too much for the researcher?**  
  With stage-based defaults, the researcher can: (1) Pick a **persona** (sets stage + behavior in one go), or (2) Set **stage** and get behavior defaults, then tweak only what matters. That keeps the panel powerful without making manual data entry a burden.

Planned behavior defaults by stage (examples):

- Stage 1: view count low, no contact, no visit, saved = 0.
- Stage 2: view count 3–5, no contact, no visit, saved 0–1.
- Stage 3: view count 5–8, no contact, no visit, saved 2–4.
- Stage 4: view count 5+, contact = Yes, visit = No, saved 3+.
- Stage 5: contact = Yes, visit = Yes.

---

## 5. Reducing the number of fields

We can simplify without losing simulation power:

- **User identity:** Keep **Name** (for session naming and preview). Make **Age**, **Occupation**, **Works near** optional or collapse into “Optional details.”
- **Stage:** Keep **Stage 1–5** and **Last visit (days ago)** (needed for rules like “30+ days → soft reset”).
- **Location:** Keep **Primary** and **Secondary** (both drive content).
- **Filters:** Keep **Budget min/max** and **BHK**; **Ready to move** can be a single dropdown (Yes / No / Either) — already minimal.
- **Behavior:** After adding **stage-based defaults**, we can:
  - Show only **key overrides**: e.g. “Contacted developer”, “Visited site”, and one “Engagement” selector (Low / Medium / High) that maps to view count + saved count.
  - Or keep current fields but **hide** the ones that are auto-set until the researcher expands “Advanced behavior.”

So: fewer visible fields by default, with optional/advanced sections and stage-driven defaults.

---

## 6. Responsive / mobile-friendly panel

The panel is updated so that:

- On **narrow viewports** (e.g. phone/tablet), the layout stacks or reflows: e.g. sidebar first (scrollable), then preview below, or a tab/toggle to switch between “Form” and “Preview.”
- Touch targets and font sizes are usable on small screens; buttons and inputs don’t overflow.
- Preview iframe can scale or show a “Preview on desktop for full experience” note on very small screens if needed.

Implementation is in the panel CSS (breakpoints, flex/grid, optional hamburger or tabs).

---

## 7. Do session recordings include audio/voice?

**Current “sessions” in Supabase:**  
They store only **configuration** (the profile JSON: identity, stage, location, filters, behavior). There is **no** screen recording, no click stream, and **no audio/voice** today.

**If you want session recordings with audio:**

- That would be a **separate feature**: e.g. record the **browser tab** (homepage) + **microphone** during a usability session, then store or link that recording (file or URL) and optionally associate it with a session ID.
- Implementation options: use the **Browser MediaRecorder API** (getUserMedia + captureStream) for in-browser recording, or a dedicated tool (e.g. Zoom, Lookback, or a session-replay product) and attach the link to the session in the panel or in Supabase.

So: **today, no audio/voice.** It can be added as a separate “Session recording (with audio)” feature and wired to the same session ID if you want one place for both “config” and “recording.”

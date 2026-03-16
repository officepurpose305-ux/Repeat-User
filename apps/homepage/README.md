# Buyer Homepage

Stage-driven repeat-user homepage for the 99acres evolution. Consumes config from the researcher panel via `postMessage` and renders modules by buyer stage (1–5).

## Stage 1 vs 2 (not redundant)

- **S1 — Discovery:** City-level only. No engagement history yet. Hero = “Find your home in [city]” + trending strip + CTAs (Search / Explore localities). No “Continue where you left off” cards, no budget/tools/articles (spec).
- **S2 — Locality awareness:** We have context (localities, views). Hero = “Continue where you left off” + 2 cards + CTAs (See all in [loc] / Explore nearby). Localities on radar, “Now in your browsed sections”, budget nudge, adjacent, experts, tools, reads.

## Design principles (reference screens + spec)

1. **Sections match stage** — Only show modules that fit the spec for that stage. No generic “CTA block” at the bottom; CTAs live in hero/spotlight/cards.
2. **Continue where you left off** — S2+ only (when we have history). S1 = generic search prompt + trending.
3. **App-like spacing** — Tight section padding (12px vertical, 8px between sections), smaller type and cards so the feed feels dense and scannable.
4. **Personalised copy** — Uses `config` (view count, most viewed, contacted, name, location, budget, BHK).
5. **Content & images** — Placeholders for **99acres API** and **OpenAI**; replace with real data.

## Usage

- **Standalone:** Open `index.html` in a browser; uses default config (Stage 2, Sector 137/143, sample filters).
- **From panel:** Researcher panel’s preview iframe loads this page and sends `CONFIG_UPDATE` with `config` (user, stage, location, filters, behavior). Apply in the panel pushes the current form into the iframe.

## Modules (by stage)

1. **Search bar + chips** — Placeholder and context chips by stage.
2. **Hero** — Discovery prompt (S1), continue where you left off (S2–S3), decision spotlight (S4), post-visit feedback (S5).
3. **Locality** — Trending (S1), on your radar (S2), comparison table (S3), collapsed (S4), appreciation (S5).
4. **Property feed** — Titles and cards by stage.
5. **Budget/BHK nudges** — From S2; EMI in S5.
6. **Adjacent localities** — S2–S3 only.
7. **Social proof** — One-line by stage.
8. **New launches** — Hidden S4–S5.
9. **Tools strip** — From S2; varies by stage.
10. **CTAs** — Inline in hero (S1: Search / Explore localities; S2: See all / Explore nearby; S3: Compare; S4: Visit this weekend / Not interested on spotlight; S5: Confirm visit / Loan advisor). S4 also has “Find the home that feels right” strip (Compare + Plan weekend visits).
11. **Interesting reads** — S2+ only; titles vary by stage.

Content uses `config.location` (primary/secondary), `config.filters` (budget, BHK), and `config.behavior` (viewCount, mostViewedProperty, etc.) for labels and copy. Styling from `../design-system/design-system.css`.

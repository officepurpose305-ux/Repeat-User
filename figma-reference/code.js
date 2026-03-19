// 99acres Homepage Stages — Figma Plugin
// Auto-generates all 5 buyer stages with all modules

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURATION & MOCK DATA
// ═══════════════════════════════════════════════════════════════════════

const TOKENS = {
  blue: '#2563eb',
  blueLt: '#dbeafe',
  green: '#16a34a',
  greenLt: '#f0fdf4',
  purple: '#6c30d4',
  purpleLt: '#ede9fe',
  orange: '#FF6B35',
  red: '#dc2626',
  textPri: '#111111',
  textSec: '#555555',
  textTer: '#999999',
  surface: '#ffffff',
  surfaceAlt: '#f5f5f5',
  border: '#e5e7eb',
  pageBg: '#f0f0f0'
};

const MOCK_DATA = {
  primary: 'Sector 150',
  secondary: 'Sector 128',
  city: 'Noida',
  properties: [
    {
      name: 'ATS Tourmaline',
      price: '₹88L',
      sqft: '1,050 sq ft',
      bhk: '2 BHK',
      status: 'Ready to move',
      dev: 'ATS',
      lm: '5 mins from Tech Mahindra'
    },
    {
      name: 'Godrej Woods',
      price: '₹1.1Cr',
      sqft: '1,200 sq ft',
      bhk: '3 BHK',
      status: 'Possession Dec 2026',
      dev: 'Godrej',
      lm: '800m Aqua Line metro'
    },
    {
      name: 'Mahagun Moderne',
      price: '₹72L',
      sqft: '980 sq ft',
      bhk: '2 BHK',
      status: 'Ready to move',
      dev: 'Mahagun',
      lm: '2km from Sector 52 Metro'
    }
  ],
  localities: [
    { name: 'Sector 150', avgPsqft: 8100, yoy: 18, metro: 'Aqua Line · 800m', bhkRange: '₹72L–1.1Cr · 2–3BHK' },
    { name: 'Sector 128', avgPsqft: 7800, yoy: 16, metro: '2.5km', bhkRange: '₹68L–98L · 2–3BHK' }
  ],
  landmarks: {
    primary: { metro: 'Noida Sec 52 (Aqua Line)', hospital: 'Fortis Hospital', school: 'DPS Sec 132', mall: 'DLF Mall of India' },
    secondary: { metro: 'Sec 51 Metro (2.5km)', hospital: 'Kailash Hospital', school: 'KV School', mall: 'Great India Place' }
  }
};

// ═══════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b };
}

function createText(content, size = 14, weight = 400, colorHex = TOKENS.textPri) {
  const text = figma.createText();
  text.characters = content;
  text.fontSize = size;

  // Load font async
  figma.loadFontAsync({ family: 'Roboto', style: weight === 700 ? 'Bold' : 'Regular' }).then(() => {
    text.fontName = { family: 'Roboto', style: weight === 700 ? 'Bold' : 'Regular' };
  });

  const rgb = hexToRgb(colorHex);
  text.fills = [{ type: 'SOLID', color: { r: rgb.r, g: rgb.g, b: rgb.b } }];

  return text;
}

function createRect(w, h, colorHex = TOKENS.surface, radius = 8) {
  const rect = figma.createRectangle();
  rect.resize(w, h);

  const rgb = hexToRgb(colorHex);
  rect.fills = [{ type: 'SOLID', color: { r: rgb.r, g: rgb.g, b: rgb.b } }];
  rect.cornerRadius = radius;

  return rect;
}

function createAutoFrame(name, direction = 'VERTICAL', width = 360, height = null, gap = 8, padH = 14, padV = 12) {
  const frame = figma.createFrame();
  frame.name = name;
  frame.layoutMode = direction;
  frame.primaryAxisAlignItems = 'MIN';
  frame.counterAxisAlignItems = 'STRETCH';
  frame.itemSpacing = gap;
  frame.paddingLeft = padH;
  frame.paddingRight = padH;
  frame.paddingTop = padV;
  frame.paddingBottom = padV;
  frame.resize(width, height || 760);

  const rgb = hexToRgb(TOKENS.pageBg);
  frame.fills = [{ type: 'SOLID', color: { r: rgb.r, g: rgb.g, b: rgb.b } }];

  return frame;
}

function createSection(title = '') {
  const section = figma.createFrame();
  section.layoutMode = 'VERTICAL';
  section.itemSpacing = 0;
  section.primaryAxisAlignItems = 'MIN';
  section.counterAxisAlignItems = 'STRETCH';
  section.resize(360, 'auto');
  section.name = title || 'Section';

  const rgb = hexToRgb(TOKENS.surface);
  section.fills = [{ type: 'SOLID', color: { r: rgb.r, g: rgb.g, b: rgb.b } }];

  return section;
}

function createButton(label, bgColor = TOKENS.blue, textColor = TOKENS.surface, height = 40) {
  const btn = figma.createRectangle();
  btn.resize(120, height);
  btn.cornerRadius = 20;

  const bgRgb = hexToRgb(bgColor);
  btn.fills = [{ type: 'SOLID', color: { r: bgRgb.r, g: bgRgb.g, b: bgRgb.b } }];

  const text = createText(label, 13, 600, textColor);
  return btn;
}

// ═══════════════════════════════════════════════════════════════════════
// PER-MODULE RENDER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

function renderContextChips(stage) {
  const container = createAutoFrame('modContextChips', 'HORIZONTAL', 360, 60, 8, 14, 12);

  const chip1 = createRect(120, 36, TOKENS.blue, 20);
  const text1 = createText(MOCK_DATA.primary, 13, 600, TOKENS.surface);

  container.appendChild(chip1);
  container.appendChild(text1);

  return container;
}

function renderHero(stage) {
  const section = createAutoFrame('modHero', 'VERTICAL', 360, 200, 8, 16, 20);

  // Background gradient (approximation with solid blue)
  const bg = createRect(360, 200, TOKENS.blue);

  const title = createText(`Find your next home in ${MOCK_DATA.city}`, 24, 800, TOKENS.surface);
  const stats = createText('1.3k properties · ₹70L–1.5Cr · All types', 12, 400, TOKENS.surface);

  section.appendChild(bg);
  section.appendChild(title);
  section.appendChild(stats);

  return section;
}

function renderBudgetAnchor(stage) {
  const section = createAutoFrame('modBudgetAnchor', 'VERTICAL', 360, 120);
  const title = createText('Budget-wise breakdown', 14, 700, TOKENS.textPri);
  section.appendChild(title);

  // Grid simulation: 3 cards in a row
  const cardFrame = figma.createFrame();
  cardFrame.layoutMode = 'HORIZONTAL';
  cardFrame.itemSpacing = 8;
  cardFrame.resize(320, 100);

  for (let i = 0; i < 3; i++) {
    const card = createRect(100, 100, TOKENS.blueLt, 8);
    const label = createText(['Entry', 'Mid', 'Premium'][i], 11, 700, TOKENS.textSec);
    cardFrame.appendChild(card);
  }

  section.appendChild(cardFrame);
  return section;
}

function renderPriceTrend(stage) {
  const section = createAutoFrame('modPriceTrend', 'HORIZONTAL', 360, 80, 10, 14, 12);
  section.name = 'modPriceTrend';

  // Icon circle
  const circle = createRect(40, 40, TOKENS.greenLt, 20);

  // Text content
  const growth = createText(`+${MOCK_DATA.localities[0].yoy}% price growth`, 15, 700, TOKENS.green);
  const locality = createText(`${MOCK_DATA.primary} · YoY appreciation`, 11, 400, TOKENS.textTer);

  const textFrame = figma.createFrame();
  textFrame.layoutMode = 'VERTICAL';
  textFrame.itemSpacing = 2;
  textFrame.appendChild(growth);
  textFrame.appendChild(locality);

  section.appendChild(circle);
  section.appendChild(textFrame);

  return section;
}

function renderNewLaunches(stage) {
  const section = createSection('modNewLaunches');
  const title = createText('New launches this month', 14, 700, TOKENS.textPri);
  const prop = MOCK_DATA.properties[1];
  const propText = createText(`${prop.name} · ${prop.price}`, 12, 700, TOKENS.textPri);

  section.appendChild(title);
  section.appendChild(propText);

  return section;
}

function renderConsiderationSet(stage) {
  if (stage !== 2) return null;

  const section = createAutoFrame('modConsiderationSet', 'VERTICAL', 360, 180, 6, 14, 14);
  const title = createText('What\'s your ideal property?', 14, 700, TOKENS.textPri);
  section.appendChild(title);

  const options = ['Ready to move', 'Under construction', 'New launch'];
  options.forEach((opt, idx) => {
    const card = createRect(330, 50, idx === 0 ? TOKENS.blueLt : TOKENS.surface, 12);
    const label = createText(opt, 13, 700, TOKENS.textPri);
    section.appendChild(card);
  });

  return section;
}

function renderLocalitySuggestions(stage) {
  if (stage < 2 || stage > 3) return null;

  const section = createAutoFrame('modLocalitySuggestions', 'VERTICAL', 360, 150);
  const title = createText('Nearby options', 14, 700, TOKENS.textPri);
  section.appendChild(title);

  MOCK_DATA.localities.forEach(loc => {
    const card = createRect(330, 50, TOKENS.surface, 8);
    const text = createText(`${loc.name} · ${loc.avgPsqft} psqft · +${loc.yoy}% YoY`, 12, 600, TOKENS.textPri);
    section.appendChild(card);
  });

  return section;
}

function renderHeadToHead(stage) {
  if (stage !== 3) return null;

  const section = createAutoFrame('modHeadToHead', 'VERTICAL', 360, 200);
  const title = createText(`${MOCK_DATA.primary} vs ${MOCK_DATA.secondary}`, 14, 700, TOKENS.textPri);
  section.appendChild(title);

  const rows = [
    { label: 'Entry price/sqft', v1: '₹8.1k', v2: '₹7.8k', winner: 1 },
    { label: 'YoY growth', v1: '+18%', v2: '+16%', winner: 2 },
    { label: 'Metro distance', v1: '800m', v2: '2.5km', winner: 1 }
  ];

  rows.forEach(row => {
    const rowFrame = figma.createFrame();
    rowFrame.layoutMode = 'HORIZONTAL';
    rowFrame.itemSpacing = 10;
    rowFrame.resize(330, 40);

    const label = createText(row.label, 10, 600, TOKENS.textTer);
    const val1Color = row.winner === 1 ? TOKENS.green : TOKENS.textPri;
    const val1 = createText(row.v1, 11, 700, val1Color);
    const val2Color = row.winner === 2 ? TOKENS.green : TOKENS.textPri;
    const val2 = createText(row.v2, 11, 700, val2Color);

    rowFrame.appendChild(label);
    rowFrame.appendChild(val1);
    rowFrame.appendChild(val2);
    section.appendChild(rowFrame);
  });

  return section;
}

function renderPostVisitTools(stage) {
  if (stage !== 5) return null;

  const section = createAutoFrame('modPostVisitTools', 'VERTICAL', 360, 250);
  const title = createText('Tools for your next step', 14, 700, TOKENS.textPri);
  section.appendChild(title);

  const tools = [
    { name: 'EMI Calculator', color: TOKENS.blue },
    { name: 'Home Loan Guide', color: TOKENS.green },
    { name: 'Stamp Duty Estimator', color: TOKENS.orange },
    { name: 'Possession Checklist', color: TOKENS.purple }
  ];

  tools.forEach(tool => {
    const toolFrame = figma.createFrame();
    toolFrame.layoutMode = 'HORIZONTAL';
    toolFrame.itemSpacing = 12;
    toolFrame.resize(330, 50);

    const icon = createRect(40, 40, tool.color, 8);
    const label = createText(tool.name, 14, 700, TOKENS.textPri);

    toolFrame.appendChild(icon);
    toolFrame.appendChild(label);
    section.appendChild(toolFrame);
  });

  return section;
}

function renderStillConsidering(stage) {
  if (stage < 4) return null;

  const section = createAutoFrame('modStillConsidering', 'VERTICAL', 360, 180);
  const title = createText(stage === 5 ? 'How did your visits compare?' : 'Still in the running', 14, 700, TOKENS.textPri);
  section.appendChild(title);

  MOCK_DATA.properties.slice(1, 3).forEach(prop => {
    const card = createRect(330, 60, TOKENS.surface, 8);
    const text = createText(`${prop.name} · ${prop.price}`, 12, 700, TOKENS.textPri);
    section.appendChild(card);
  });

  return section;
}

function renderTools(stage) {
  if (stage === 1 || stage === 5) return null;

  const section = createAutoFrame('modTools', 'HORIZONTAL', 360, 80, 8, 14, 12);

  const tools = stage === 2
    ? ['Price Trends', 'Buyer\'s Guide']
    : stage === 3
    ? ['EMI', 'Home Loan', 'Price Check']
    : ['EMI', 'Loan Eligibility'];

  tools.slice(0, 2).forEach(tool => {
    const card = createRect(150, 60, TOKENS.surfaceAlt, 8);
    const label = createText(tool, 12, 700, TOKENS.textPri);
    section.appendChild(card);
  });

  return section;
}

function renderArticles(stage) {
  if (stage === 1) return null;

  const section = createAutoFrame('modArticles', 'VERTICAL', 360, 100);

  const articles = stage === 2
    ? ['Sector insights', 'Investment guide']
    : stage === 3
    ? ['Comparison guide', 'Landmark info']
    : stage === 4
    ? ['Deal timeline', 'Document prep']
    : ['Negotiation tips', 'Closing checklist'];

  articles.forEach(article => {
    const row = createRect(330, 40, TOKENS.surface, 6);
    const label = createText(article, 13, 700, TOKENS.textPri);
    section.appendChild(row);
  });

  return section;
}

function renderQuickLinks(stage) {
  const section = createAutoFrame('modQuickLinks', 'HORIZONTAL', 360, 60, 6, 14, 12);

  const links = ['Buy', 'Rent', 'New Projects', 'Price Trends'];
  links.forEach(link => {
    const chip = createRect(80, 36, TOKENS.surface, 20);
    const text = createText(link, 12, 600, TOKENS.textPri);
    section.appendChild(chip);
  });

  return section;
}

// ═══════════════════════════════════════════════════════════════════════
// STAGE BUILDER
// ═══════════════════════════════════════════════════════════════════════

function buildStage(stage) {
  const modules = [];

  // Stage-specific module order (matches homepage renderPage)
  if (stage === 1) {
    modules.push(renderHero(stage));
    modules.push(renderBudgetAnchor(stage));
    modules.push(renderLocalitySuggestions(stage) || renderPriceTrend(stage));
    modules.push(renderNewLaunches(stage));
    modules.push(renderPriceTrend(stage));
    modules.push(renderArticles(stage));
    modules.push(renderQuickLinks(stage));
  } else if (stage === 2) {
    modules.push(renderContextChips(stage));
    modules.push(renderLocalitySuggestions(stage));
    modules.push(renderConsiderationSet(stage));
    modules.push(renderPriceTrend(stage));
    modules.push(renderTools(stage));
    modules.push(renderArticles(stage));
    modules.push(renderQuickLinks(stage));
  } else if (stage === 3) {
    modules.push(renderContextChips(stage));
    modules.push(renderHeadToHead(stage));
    modules.push(renderNearestLandmarks(stage) || renderPriceTrend(stage));
    modules.push(renderPriceTrend(stage));
    modules.push(renderTools(stage));
    modules.push(renderArticles(stage));
    modules.push(renderQuickLinks(stage));
  } else if (stage === 4) {
    modules.push(renderContextChips(stage));
    modules.push(renderStillConsidering(stage));
    modules.push(renderPriceTrend(stage));
    modules.push(renderTools(stage));
    modules.push(renderArticles(stage));
    modules.push(renderQuickLinks(stage));
  } else if (stage === 5) {
    modules.push(renderContextChips(stage));
    modules.push(renderPostVisitTools(stage));
    modules.push(renderStillConsidering(stage));
    modules.push(renderPriceTrend(stage));
    modules.push(renderArticles(stage));
    modules.push(renderQuickLinks(stage));
  }

  return modules.filter(m => m !== null);
}

function createStagePage(stage) {
  const pageName = ['', 'Discovery', 'Locality Awareness', 'Comparison', 'Shortlist', 'Post-Visit'][stage];
  const page = figma.createPage();
  page.name = `S${stage} — ${pageName}`;

  // Create phone frame
  const phoneFrame = figma.createFrame();
  phoneFrame.name = `Phone Frame S${stage}`;
  phoneFrame.resize(360, 760);

  // Set bg to light gray
  const bgRgb = hexToRgb(TOKENS.pageBg);
  phoneFrame.fills = [{ type: 'SOLID', color: { r: bgRgb.r, g: bgRgb.g, b: bgRgb.b } }];

  // Create scrollable content frame inside
  const contentFrame = createAutoFrame(`S${stage} Content`, 'VERTICAL', 360, null, 8, 0, 0);

  // Add all modules
  const modules = buildStage(stage);
  modules.forEach(module => {
    if (module) {
      contentFrame.appendChild(module);
    }
  });

  phoneFrame.appendChild(contentFrame);
  page.appendChild(phoneFrame);

  return page;
}

// ═══════════════════════════════════════════════════════════════════════
// MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════════════

figma.ui.onmessage = msg => {
  if (msg.type === 'GENERATE') {
    msg.stages.forEach(stage => {
      createStagePage(stage);
    });
    figma.ui.postMessage({ type: 'DONE' });
  } else if (msg.type === 'CLEAR') {
    figma.root.children.forEach(child => {
      if (child.type === 'PAGE' && child.name.match(/^S\d/)) {
        figma.root.removeChild(child);
      }
    });
  }
};

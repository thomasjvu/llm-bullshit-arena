// Cute Pixel Art Playing Card Generator
// Rounder, friendlier card designs

const SUITS = {
  H: { name: 'heart', color: '#f5a9b8', darkColor: '#e8889a' },
  D: { name: 'diamond', color: '#f5d0a9', darkColor: '#e8b88a' },
  C: { name: 'club', color: '#9eecd9', darkColor: '#7dd4c4' },
  S: { name: 'spade', color: '#b0b0c4', darkColor: '#8888a0' }
};

// Cute rounded suit patterns (10x10)
const SUIT_PATTERNS = {
  heart: [
    '   ##  ##   ',
    '  ########  ',
    ' ########## ',
    ' ########## ',
    ' ########## ',
    '  ########  ',
    '   ######   ',
    '    ####    ',
    '     ##     ',
  ],
  diamond: [
    '     ##     ',
    '    ####    ',
    '   ######   ',
    '  ########  ',
    ' ########## ',
    '  ########  ',
    '   ######   ',
    '    ####    ',
    '     ##     ',
  ],
  club: [
    '    ####    ',
    '   ######   ',
    '    ####    ',
    ' ########## ',
    '############',
    ' ########## ',
    '    ####    ',
    '   ######   ',
    '  ########  ',
  ],
  spade: [
    '     ##     ',
    '    ####    ',
    '   ######   ',
    '  ########  ',
    ' ########## ',
    ' ########## ',
    '    ####    ',
    '   ######   ',
    '  ########  ',
  ]
};

// Cute rounded pixel font for ranks (6x8 with softer edges)
const RANK_PATTERNS = {
  'A': [
    '  ##  ',
    ' #  # ',
    '#    #',
    '#    #',
    '######',
    '#    #',
    '#    #',
  ],
  '2': [
    ' #### ',
    '#    #',
    '     #',
    '  ### ',
    ' #    ',
    '#     ',
    '######',
  ],
  '3': [
    ' #### ',
    '#    #',
    '     #',
    '  ### ',
    '     #',
    '#    #',
    ' #### ',
  ],
  '4': [
    '#    #',
    '#    #',
    '#    #',
    '######',
    '     #',
    '     #',
    '     #',
  ],
  '5': [
    '######',
    '#     ',
    '##### ',
    '     #',
    '     #',
    '#    #',
    ' #### ',
  ],
  '6': [
    ' #### ',
    '#     ',
    '#     ',
    '##### ',
    '#    #',
    '#    #',
    ' #### ',
  ],
  '7': [
    '######',
    '     #',
    '    # ',
    '   #  ',
    '   #  ',
    '   #  ',
    '   #  ',
  ],
  '8': [
    ' #### ',
    '#    #',
    '#    #',
    ' #### ',
    '#    #',
    '#    #',
    ' #### ',
  ],
  '9': [
    ' #### ',
    '#    #',
    '#    #',
    ' #####',
    '     #',
    '     #',
    ' #### ',
  ],
  '10': [
    '# ####',
    '##   #',
    '#    #',
    '#    #',
    '#    #',
    '#    #',
    '# ####',
  ],
  'J': [
    '     #',
    '     #',
    '     #',
    '     #',
    '     #',
    '#    #',
    ' #### ',
  ],
  'Q': [
    ' #### ',
    '#    #',
    '#    #',
    '#    #',
    '# ## #',
    '#   # ',
    ' ### #',
  ],
  'K': [
    '#    #',
    '#   # ',
    '#  #  ',
    '###   ',
    '#  #  ',
    '#   # ',
    '#    #',
  ],
};

function patternToPixels(pattern, color, startX, startY, pixelSize = 2) {
  let pixels = '';
  pattern.forEach((row, y) => {
    [...row].forEach((char, x) => {
      if (char === '#') {
        // Rounded corners for each pixel
        pixels += `<rect x="${startX + x * pixelSize}" y="${startY + y * pixelSize}" width="${pixelSize}" height="${pixelSize}" rx="0.5" fill="${color}"/>`;
      }
    });
  });
  return pixels;
}

function createCardSVG(rank, suit) {
  const suitInfo = SUITS[suit];
  const color = suitInfo.color;
  const darkColor = suitInfo.darkColor;

  const width = 64;
  const height = 88;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`;

  // Soft rounded card background with gradient
  svg += `<defs>
    <linearGradient id="cardBg${rank}${suit}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff"/>
      <stop offset="100%" style="stop-color:#f4f4f6"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.1"/>
    </filter>
  </defs>`;

  // Card base with very rounded corners
  svg += `<rect x="2" y="2" width="${width - 4}" height="${height - 4}" fill="url(#cardBg${rank}${suit})" rx="8" ry="8" filter="url(#softShadow)"/>`;

  // Soft border
  svg += `<rect x="2" y="2" width="${width - 4}" height="${height - 4}" fill="none" stroke="${color}" stroke-width="2" rx="8" ry="8" opacity="0.5"/>`;

  // Corner rank (top-left)
  const rankPattern = RANK_PATTERNS[rank];
  if (rankPattern) {
    svg += patternToPixels(rankPattern, darkColor, 6, 6, 2);
  }

  // Corner suit (top-left, below rank)
  const suitPattern = SUIT_PATTERNS[suitInfo.name];
  svg += patternToPixels(suitPattern, color, 4, 22, 1);

  // Center suit (larger, main focus)
  svg += patternToPixels(suitPattern, color, width / 2 - 6, height / 2 - 5, 2);

  // Cute sparkle decoration
  svg += `<circle cx="${width - 10}" cy="12" r="2" fill="${color}" opacity="0.6"/>`;
  svg += `<circle cx="${width - 14}" cy="8" r="1" fill="${color}" opacity="0.4"/>`;

  // Bottom-right rank (rotated 180)
  if (rankPattern) {
    const flippedRank = rankPattern.map(r => [...r].reverse().join('')).reverse();
    svg += patternToPixels(flippedRank, darkColor, width - 18, height - 20, 2);
  }

  // Bottom-right suit
  const flippedSuit = suitPattern.map(r => [...r].reverse().join('')).reverse();
  svg += patternToPixels(flippedSuit, color, width - 16, height - 32, 1);

  svg += '</svg>';
  return svg;
}

function createCardBackSVG() {
  const width = 64;
  const height = 88;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`;

  // Gradient background
  svg += `<defs>
    <linearGradient id="backGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#282830"/>
      <stop offset="50%" style="stop-color:#18181e"/>
      <stop offset="100%" style="stop-color:#282830"/>
    </linearGradient>
    <pattern id="dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="1.5" fill="#9a9ab0" opacity="0.3"/>
    </pattern>
  </defs>`;

  // Card base
  svg += `<rect x="2" y="2" width="${width - 4}" height="${height - 4}" fill="url(#backGrad)" rx="8" ry="8"/>`;

  // Dot pattern
  svg += `<rect x="6" y="6" width="${width - 12}" height="${height - 12}" fill="url(#dots)" rx="4"/>`;

  // Border decorations
  svg += `<rect x="4" y="4" width="${width - 8}" height="${height - 8}" fill="none" stroke="#9a9ab0" stroke-width="1.5" rx="6" opacity="0.4"/>`;
  svg += `<rect x="8" y="8" width="${width - 16}" height="${height - 16}" fill="none" stroke="#9a9ab0" stroke-width="1" rx="4" stroke-dasharray="4 2" opacity="0.3"/>`;

  // Center decoration - cute star
  const cx = width / 2;
  const cy = height / 2;
  svg += `<polygon points="${cx},${cy - 8} ${cx + 3},${cy - 2} ${cx + 9},${cy - 2} ${cx + 4},${cy + 2} ${cx + 6},${cy + 8} ${cx},${cy + 5} ${cx - 6},${cy + 8} ${cx - 4},${cy + 2} ${cx - 9},${cy - 2} ${cx - 3},${cy - 2}" fill="#9a9ab0" opacity="0.5"/>`;

  // Corner sparkles
  svg += `<circle cx="12" cy="12" r="2" fill="#f5a9b8" opacity="0.5"/>`;
  svg += `<circle cx="${width - 12}" cy="12" r="2" fill="#9eecd9" opacity="0.5"/>`;
  svg += `<circle cx="12" cy="${height - 12}" r="2" fill="#9eecd9" opacity="0.5"/>`;
  svg += `<circle cx="${width - 12}" cy="${height - 12}" r="2" fill="#f5a9b8" opacity="0.5"/>`;

  svg += '</svg>';
  return svg;
}

// Generate all cards
function generateAllCards() {
  const cards = {};
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const suits = ['H', 'D', 'C', 'S'];

  for (const rank of ranks) {
    for (const suit of suits) {
      const key = `${rank}${suit}`;
      cards[key] = createCardSVG(rank, suit);
    }
  }

  cards['back'] = createCardBackSVG();
  return cards;
}

// Export for use
const CARD_SVGS = generateAllCards();

function getCardSVG(cardString) {
  return CARD_SVGS[cardString] || CARD_SVGS['back'];
}

function getCardBackSVG() {
  return CARD_SVGS['back'];
}

function createCardElement(cardString, showFace = true) {
  const div = document.createElement('div');
  div.className = 'card-mini';
  div.innerHTML = showFace ? getCardSVG(cardString) : getCardBackSVG();
  return div;
}

// Expose globally
window.CardRenderer = {
  getCardSVG,
  getCardBackSVG,
  createCardElement,
  CARD_SVGS
};

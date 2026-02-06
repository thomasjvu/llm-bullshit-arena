// Model Themes — visual identity for each LLM
// Each model gets a unique color palette, background, and character emblem

window.ModelThemes = (() => {

  const themes = {

    'google/gemma-3-27b-it': {
      name: 'Gemma-3-27B',
      shortName: 'Gemma',
      title: 'THE GEM',
      accent: '#00bbdd',
      accentBright: '#33ddff',
      accentDim: '#006688',
      secondary: '#0055aa',
      bg: [
        'radial-gradient(ellipse at 50% 30%, rgba(0,187,221,0.12) 0%, transparent 55%)',
        'radial-gradient(ellipse at 70% 80%, rgba(0,85,170,0.08) 0%, transparent 40%)',
        'radial-gradient(ellipse at 20% 60%, rgba(0,187,221,0.05) 0%, transparent 35%)',
        'linear-gradient(180deg, #050f14 0%, #081a22 35%, #06131a 70%, #030a0d 100%)',
      ].join(', '),
      patternSVG: `<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="30" stroke="rgba(0,187,221,0.03)" stroke-width="1" fill="none"/><circle cx="40" cy="40" r="18" stroke="rgba(0,187,221,0.04)" stroke-width="0.5" fill="none"/><circle cx="10" cy="10" r="2" fill="rgba(0,187,221,0.03)"/><circle cx="70" cy="60" r="1.5" fill="rgba(0,187,221,0.03)"/></svg>`,
      character() {
        return `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="ds-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#00bbdd" stop-opacity="0.3"/>
              <stop offset="60%" stop-color="#0055aa" stop-opacity="0.1"/>
              <stop offset="100%" stop-color="#00bbdd" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="ds-iris" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#33ddff"/>
              <stop offset="60%" stop-color="#0088bb"/>
              <stop offset="100%" stop-color="#003355"/>
            </radialGradient>
          </defs>
          <circle cx="80" cy="80" r="72" fill="url(#ds-glow)"/>
          <!-- Outer rings — sonar/depth -->
          <circle cx="80" cy="80" r="58" stroke="#00bbdd" stroke-width="1" fill="none" opacity="0.15"/>
          <circle cx="80" cy="80" r="50" stroke="#00bbdd" stroke-width="0.8" fill="none" opacity="0.12"/>
          <circle cx="80" cy="80" r="42" stroke="#00bbdd" stroke-width="0.6" fill="none" opacity="0.1"/>
          <!-- Eye shape — almond -->
          <ellipse cx="80" cy="80" rx="38" ry="22" fill="#081a22" stroke="#00bbdd" stroke-width="1.5" opacity="0.9"/>
          <!-- Iris -->
          <circle cx="80" cy="80" r="16" fill="url(#ds-iris)" opacity="0.9"/>
          <!-- Pupil — vertical slit -->
          <ellipse cx="80" cy="80" rx="4" ry="14" fill="#030a0d"/>
          <!-- Iris detail rings -->
          <circle cx="80" cy="80" r="12" stroke="#33ddff" stroke-width="0.5" fill="none" opacity="0.3"/>
          <circle cx="80" cy="80" r="8" stroke="#33ddff" stroke-width="0.3" fill="none" opacity="0.2"/>
          <!-- Highlight -->
          <circle cx="74" cy="74" r="3" fill="#ffffff" opacity="0.5"/>
          <circle cx="86" cy="85" r="1.5" fill="#ffffff" opacity="0.25"/>
          <!-- Depth particles -->
          <circle cx="45" cy="45" r="1.5" fill="#00bbdd" opacity="0.3"/>
          <circle cx="115" cy="50" r="1" fill="#33ddff" opacity="0.25"/>
          <circle cx="50" cy="115" r="1.2" fill="#00bbdd" opacity="0.2"/>
          <circle cx="110" cy="110" r="0.8" fill="#33ddff" opacity="0.2"/>
        </svg>`;
      }
    },

    'moonshotai/Kimi-K2-Instruct': {
      name: 'Kimi-K2-Instruct',
      shortName: 'Kimi',
      title: 'THE MOON',
      accent: '#b388ff',
      accentBright: '#d4b5ff',
      accentDim: '#7744bb',
      secondary: '#e0e0e0',
      bg: [
        'radial-gradient(ellipse at 40% 25%, rgba(179,136,255,0.12) 0%, transparent 50%)',
        'radial-gradient(ellipse at 65% 75%, rgba(212,181,255,0.06) 0%, transparent 40%)',
        'linear-gradient(180deg, #0d0816 0%, #140e22 35%, #100a1c 70%, #080510 100%)',
      ].join(', '),
      patternSVG: `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="20" r="1" fill="rgba(212,181,255,0.06)"/><circle cx="75" cy="45" r="0.8" fill="rgba(212,181,255,0.05)"/><circle cx="40" cy="80" r="1.2" fill="rgba(212,181,255,0.04)"/><circle cx="90" cy="15" r="0.6" fill="rgba(212,181,255,0.07)"/><circle cx="10" cy="60" r="0.7" fill="rgba(212,181,255,0.04)"/><circle cx="60" cy="90" r="0.5" fill="rgba(212,181,255,0.05)"/></svg>`,
      character() {
        return `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="km-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#b388ff" stop-opacity="0.25"/>
              <stop offset="70%" stop-color="#b388ff" stop-opacity="0.06"/>
              <stop offset="100%" stop-color="#b388ff" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="km-moon" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#e0d0ff"/>
              <stop offset="100%" stop-color="#9966dd"/>
            </linearGradient>
          </defs>
          <circle cx="80" cy="80" r="72" fill="url(#km-glow)"/>
          <circle cx="80" cy="80" r="56" stroke="#b388ff" stroke-width="0.8" fill="none" opacity="0.12"/>
          <!-- Crescent moon -->
          <circle cx="75" cy="75" r="34" fill="url(#km-moon)" opacity="0.85"/>
          <circle cx="90" cy="65" r="28" fill="#0d0816"/>
          <!-- Moon surface details -->
          <circle cx="62" cy="68" r="4" fill="#9966dd" opacity="0.15"/>
          <circle cx="70" cy="88" r="6" fill="#9966dd" opacity="0.1"/>
          <circle cx="58" cy="82" r="3" fill="#9966dd" opacity="0.12"/>
          <!-- Stars -->
          <circle cx="115" cy="42" r="2" fill="#e0d0ff" opacity="0.7"/>
          <circle cx="108" cy="55" r="1" fill="#d4b5ff" opacity="0.5"/>
          <circle cx="120" cy="65" r="1.3" fill="#e0d0ff" opacity="0.4"/>
          <circle cx="105" cy="100" r="1.5" fill="#d4b5ff" opacity="0.5"/>
          <circle cx="115" cy="88" r="0.8" fill="#e0d0ff" opacity="0.6"/>
          <circle cx="45" cy="42" r="1" fill="#d4b5ff" opacity="0.35"/>
          <circle cx="52" cy="110" r="1.2" fill="#e0d0ff" opacity="0.3"/>
          <!-- Subtle moon glow ring -->
          <circle cx="75" cy="75" r="38" stroke="#e0d0ff" stroke-width="0.5" fill="none" opacity="0.15"/>
        </svg>`;
      }
    },

    'meta-llama/Llama-3.1-70B-Instruct': {
      name: 'Llama-3.1-70B',
      shortName: 'Llama3.1',
      title: 'THE LLAMA',
      accent: '#e67e22',
      accentBright: '#f0a050',
      accentDim: '#a05510',
      secondary: '#f5c48a',
      bg: [
        'radial-gradient(ellipse at 50% 30%, rgba(230,126,34,0.12) 0%, transparent 55%)',
        'radial-gradient(ellipse at 30% 75%, rgba(245,196,138,0.06) 0%, transparent 40%)',
        'linear-gradient(180deg, #140c04 0%, #1e1208 35%, #160e05 70%, #0d0803 100%)',
      ].join(', '),
      patternSVG: `<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><circle cx="15" cy="15" r="2" fill="rgba(230,126,34,0.03)"/><circle cx="45" cy="45" r="1.5" fill="rgba(230,126,34,0.03)"/></svg>`,
      character() {
        return `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="80" r="72" fill="rgba(230,126,34,0.12)"/>
          <circle cx="80" cy="80" r="56" stroke="#e67e22" stroke-width="1.2" fill="none" opacity="0.15"/>
          <!-- Llama head silhouette -->
          <ellipse cx="80" cy="85" rx="28" ry="32" fill="#e67e22" opacity="0.8"/>
          <!-- Ears -->
          <ellipse cx="62" cy="48" rx="6" ry="16" fill="#f0a050" opacity="0.85" transform="rotate(-15 62 48)"/>
          <ellipse cx="98" cy="48" rx="6" ry="16" fill="#f0a050" opacity="0.85" transform="rotate(15 98 48)"/>
          <ellipse cx="62" cy="50" rx="3" ry="10" fill="#140c04" opacity="0.4" transform="rotate(-15 62 50)"/>
          <ellipse cx="98" cy="50" rx="3" ry="10" fill="#140c04" opacity="0.4" transform="rotate(15 98 50)"/>
          <!-- Eyes -->
          <ellipse cx="72" cy="78" rx="4" ry="4.5" fill="#f5c48a" opacity="0.9"/>
          <ellipse cx="88" cy="78" rx="4" ry="4.5" fill="#f5c48a" opacity="0.9"/>
          <circle cx="72" cy="78" r="2" fill="#140c04"/>
          <circle cx="88" cy="78" r="2" fill="#140c04"/>
          <!-- Nose -->
          <ellipse cx="80" cy="92" rx="6" ry="4" fill="#a05510" opacity="0.5"/>
          <circle cx="77" cy="92" r="1.5" fill="#140c04" opacity="0.4"/>
          <circle cx="83" cy="92" r="1.5" fill="#140c04" opacity="0.4"/>
          <!-- Mouth -->
          <path d="M75 98 Q80 102 85 98" stroke="#a05510" stroke-width="1" fill="none" opacity="0.5"/>
          <!-- Neck fluff -->
          <path d="M58 105 Q65 115 72 108 Q78 118 85 108 Q92 118 100 105" stroke="#f0a050" stroke-width="1.5" fill="none" opacity="0.4"/>
        </svg>`;
      }
    },

    'meta-llama/Meta-Llama-3-70B-Instruct': {
      name: 'Llama-3-70B',
      shortName: 'Llama3',
      title: 'THE ELDER',
      accent: '#cc5500',
      accentBright: '#ee7722',
      accentDim: '#883300',
      secondary: '#e8a060',
      bg: [
        'radial-gradient(ellipse at 45% 35%, rgba(204,85,0,0.12) 0%, transparent 55%)',
        'radial-gradient(ellipse at 65% 70%, rgba(232,160,96,0.06) 0%, transparent 40%)',
        'linear-gradient(180deg, #120804 0%, #1a0e06 35%, #140a04 70%, #0a0502 100%)',
      ].join(', '),
      patternSVG: `<svg width="70" height="70" xmlns="http://www.w3.org/2000/svg"><path d="M10 60 L20 50 L30 60" stroke="rgba(204,85,0,0.03)" fill="none"/><path d="M40 20 L50 10 L60 20" stroke="rgba(204,85,0,0.03)" fill="none"/></svg>`,
      character() {
        return `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="80" r="72" fill="rgba(204,85,0,0.1)"/>
          <circle cx="80" cy="80" r="56" stroke="#cc5500" stroke-width="1" fill="none" opacity="0.15"/>
          <!-- Shield shape -->
          <path d="M80 30 L115 50 L115 95 Q115 120 80 135 Q45 120 45 95 L45 50 Z" fill="#cc5500" opacity="0.2" stroke="#cc5500" stroke-width="1.5" opacity="0.4"/>
          <!-- Inner shield -->
          <path d="M80 42 L105 57 L105 92 Q105 112 80 124 Q55 112 55 92 L55 57 Z" fill="none" stroke="#ee7722" stroke-width="0.8" opacity="0.3"/>
          <!-- Roman numeral III -->
          <text x="80" y="92" text-anchor="middle" font-family="serif" font-size="36" font-weight="bold" fill="#ee7722" opacity="0.75">III</text>
          <!-- Stars above -->
          <circle cx="68" cy="48" r="2" fill="#e8a060" opacity="0.5"/>
          <circle cx="80" cy="44" r="2.5" fill="#e8a060" opacity="0.6"/>
          <circle cx="92" cy="48" r="2" fill="#e8a060" opacity="0.5"/>
        </svg>`;
      }
    },

    'meta-llama/Llama-3.3-70B-Instruct': {
      name: 'Llama-3.3-70B',
      shortName: 'Llama3.3',
      title: 'THE HERD',
      accent: '#f0a030',
      accentBright: '#ffcc55',
      accentDim: '#aa7020',
      secondary: '#ffe0a0',
      bg: [
        'radial-gradient(ellipse at 55% 25%, rgba(240,160,48,0.12) 0%, transparent 55%)',
        'radial-gradient(ellipse at 40% 80%, rgba(255,224,160,0.05) 0%, transparent 35%)',
        'linear-gradient(180deg, #140f04 0%, #1e1608 35%, #161005 70%, #0d0a03 100%)',
      ].join(', '),
      patternSVG: `<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="60" r="1" fill="rgba(240,160,48,0.04)"/><circle cx="60" cy="20" r="1.5" fill="rgba(240,160,48,0.03)"/></svg>`,
      character() {
        return `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="80" r="72" fill="rgba(240,160,48,0.1)"/>
          <circle cx="80" cy="80" r="56" stroke="#f0a030" stroke-width="1" fill="none" opacity="0.15"/>
          <!-- Stylized double llama -->
          <ellipse cx="68" cy="82" rx="22" ry="26" fill="#f0a030" opacity="0.6"/>
          <ellipse cx="92" cy="82" rx="22" ry="26" fill="#f0a030" opacity="0.45"/>
          <!-- Ears - front llama -->
          <ellipse cx="56" cy="52" rx="5" ry="13" fill="#ffcc55" opacity="0.7" transform="rotate(-12 56 52)"/>
          <ellipse cx="78" cy="52" rx="5" ry="13" fill="#ffcc55" opacity="0.7" transform="rotate(8 78 52)"/>
          <!-- Ears - back llama -->
          <ellipse cx="100" cy="54" rx="4" ry="11" fill="#aa7020" opacity="0.5" transform="rotate(12 100 54)"/>
          <!-- Eyes front -->
          <circle cx="62" cy="76" r="3" fill="#ffe0a0" opacity="0.9"/>
          <circle cx="74" cy="76" r="3" fill="#ffe0a0" opacity="0.9"/>
          <circle cx="62" cy="76" r="1.5" fill="#140f04"/>
          <circle cx="74" cy="76" r="1.5" fill="#140f04"/>
          <!-- Nose front -->
          <ellipse cx="68" cy="90" rx="5" ry="3" fill="#aa7020" opacity="0.4"/>
          <!-- 3.3 version text -->
          <text x="80" y="125" text-anchor="middle" font-family="monospace" font-size="10" fill="#f0a030" opacity="0.35">3.3</text>
        </svg>`;
      }
    },

    'Qwen/Qwen3-Coder-480B-A35B-Instruct': {
      name: 'Qwen3-Coder-480B',
      shortName: 'Q3Coder',
      title: 'THE CODER',
      accent: '#7c4dff',
      accentBright: '#a47aff',
      accentDim: '#5530bb',
      secondary: '#d1c4ff',
      bg: [
        'radial-gradient(ellipse at 50% 30%, rgba(124,77,255,0.12) 0%, transparent 55%)',
        'radial-gradient(ellipse at 65% 75%, rgba(209,196,255,0.06) 0%, transparent 40%)',
        'linear-gradient(180deg, #0a0614 0%, #100c20 35%, #0c0818 70%, #06040e 100%)',
      ].join(', '),
      patternSVG: `<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><text x="5" y="20" font-family="monospace" font-size="7" fill="rgba(124,77,255,0.04)">{ }</text><text x="30" y="50" font-family="monospace" font-size="7" fill="rgba(124,77,255,0.03)">//</text></svg>`,
      character() {
        return `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="80" r="72" fill="rgba(124,77,255,0.12)"/>
          <circle cx="80" cy="80" r="56" stroke="#7c4dff" stroke-width="1" fill="none" opacity="0.15"/>
          <!-- Code brackets -->
          <text x="42" y="95" font-family="monospace" font-size="52" font-weight="bold" fill="#7c4dff" opacity="0.7">&lt;</text>
          <text x="98" y="95" font-family="monospace" font-size="52" font-weight="bold" fill="#a47aff" opacity="0.6">/&gt;</text>
          <!-- Code lines -->
          <line x1="62" y1="55" x2="98" y2="55" stroke="#d1c4ff" stroke-width="1.5" opacity="0.2"/>
          <line x1="68" y1="62" x2="92" y2="62" stroke="#7c4dff" stroke-width="1" opacity="0.15"/>
          <line x1="62" y1="105" x2="98" y2="105" stroke="#d1c4ff" stroke-width="1.5" opacity="0.2"/>
          <line x1="68" y1="98" x2="92" y2="98" stroke="#7c4dff" stroke-width="1" opacity="0.15"/>
          <!-- Cursor blink -->
          <rect x="78" y="72" width="2" height="16" fill="#a47aff" opacity="0.5"/>
        </svg>`;
      }
    },

    'Qwen/Qwen2.5-72B-Instruct': {
      name: 'Qwen2.5-72B',
      shortName: 'Q2.5-72B',
      title: 'THE SAGE',
      accent: '#3366ff',
      accentBright: '#5588ff',
      accentDim: '#2244aa',
      secondary: '#88aaff',
      bg: [
        'radial-gradient(ellipse at 50% 35%, rgba(51,102,255,0.12) 0%, transparent 55%)',
        'radial-gradient(ellipse at 35% 70%, rgba(136,170,255,0.06) 0%, transparent 40%)',
        'linear-gradient(180deg, #040814 0%, #080e20 35%, #060a18 70%, #03060e 100%)',
      ].join(', '),
      patternSVG: `<svg width="70" height="70" xmlns="http://www.w3.org/2000/svg"><circle cx="35" cy="35" r="25" stroke="rgba(51,102,255,0.025)" fill="none"/><circle cx="35" cy="35" r="12" stroke="rgba(51,102,255,0.03)" fill="none"/></svg>`,
      character() {
        return `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="80" r="72" fill="rgba(51,102,255,0.1)"/>
          <circle cx="80" cy="80" r="56" stroke="#3366ff" stroke-width="1" fill="none" opacity="0.15"/>
          <!-- Wisdom scroll -->
          <rect x="52" y="40" width="56" height="80" rx="4" fill="#3366ff" opacity="0.15" stroke="#3366ff" stroke-width="1.2" opacity="0.3"/>
          <!-- Scroll rolls top/bottom -->
          <ellipse cx="80" cy="40" rx="30" ry="5" fill="#5588ff" opacity="0.3"/>
          <ellipse cx="80" cy="120" rx="30" ry="5" fill="#5588ff" opacity="0.3"/>
          <!-- Text lines -->
          <line x1="60" y1="55" x2="100" y2="55" stroke="#88aaff" stroke-width="1.5" opacity="0.3"/>
          <line x1="60" y1="65" x2="95" y2="65" stroke="#88aaff" stroke-width="1" opacity="0.2"/>
          <line x1="60" y1="75" x2="100" y2="75" stroke="#88aaff" stroke-width="1.5" opacity="0.3"/>
          <line x1="60" y1="85" x2="90" y2="85" stroke="#88aaff" stroke-width="1" opacity="0.2"/>
          <line x1="60" y1="95" x2="100" y2="95" stroke="#88aaff" stroke-width="1.5" opacity="0.3"/>
          <line x1="60" y1="105" x2="88" y2="105" stroke="#88aaff" stroke-width="1" opacity="0.2"/>
          <!-- Seal -->
          <circle cx="92" cy="108" r="6" fill="#3366ff" opacity="0.4"/>
          <circle cx="92" cy="108" r="3" fill="#88aaff" opacity="0.3"/>
        </svg>`;
      }
    },

    'Qwen/Qwen2.5-32B-Instruct': {
      name: 'Qwen2.5-32B',
      shortName: 'Q2.5-32B',
      title: 'THE SWIFT',
      accent: '#2299dd',
      accentBright: '#44bbff',
      accentDim: '#1166aa',
      secondary: '#77ccee',
      bg: [
        'radial-gradient(ellipse at 55% 30%, rgba(34,153,221,0.12) 0%, transparent 55%)',
        'radial-gradient(ellipse at 40% 75%, rgba(119,204,238,0.06) 0%, transparent 40%)',
        'linear-gradient(180deg, #040c14 0%, #081420 35%, #060e18 70%, #03080e 100%)',
      ].join(', '),
      patternSVG: `<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><path d="M10 30 Q30 20 50 30" stroke="rgba(34,153,221,0.03)" fill="none"/><path d="M10 50 Q30 40 50 50" stroke="rgba(34,153,221,0.025)" fill="none"/></svg>`,
      character() {
        return `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="80" r="72" fill="rgba(34,153,221,0.1)"/>
          <circle cx="80" cy="80" r="56" stroke="#2299dd" stroke-width="1" fill="none" opacity="0.15"/>
          <!-- Swift bird silhouette -->
          <path d="M30 80 Q50 55 80 60 Q95 40 120 35 Q100 55 105 65 Q130 70 135 80 Q105 75 95 80 Q100 100 90 120 Q85 95 80 85 Q60 95 35 130 Q55 100 60 85 Q40 85 30 80Z" fill="#2299dd" opacity="0.7"/>
          <!-- Wing highlight -->
          <path d="M60 75 Q80 62 105 65 Q95 72 75 78Z" fill="#44bbff" opacity="0.3"/>
          <!-- Eye -->
          <circle cx="90" cy="62" r="2.5" fill="#77ccee" opacity="0.9"/>
          <circle cx="90" cy="62" r="1" fill="#040c14"/>
        </svg>`;
      }
    },

    'Qwen/Qwen2-72B-Instruct': {
      name: 'Qwen2-72B',
      shortName: 'Qwen2',
      title: 'THE ANCIENT',
      accent: '#4433aa',
      accentBright: '#6655cc',
      accentDim: '#332277',
      secondary: '#9988dd',
      bg: [
        'radial-gradient(ellipse at 50% 35%, rgba(68,51,170,0.12) 0%, transparent 55%)',
        'radial-gradient(ellipse at 60% 75%, rgba(153,136,221,0.06) 0%, transparent 40%)',
        'linear-gradient(180deg, #080614 0%, #0e0a20 35%, #0a0818 70%, #05040e 100%)',
      ].join(', '),
      patternSVG: `<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="40" height="40" stroke="rgba(68,51,170,0.025)" fill="none" transform="rotate(45 40 40)"/></svg>`,
      character() {
        return `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="80" r="72" fill="rgba(68,51,170,0.1)"/>
          <circle cx="80" cy="80" r="56" stroke="#4433aa" stroke-width="1" fill="none" opacity="0.15"/>
          <!-- Ancient pillar -->
          <rect x="65" y="45" width="30" height="70" fill="#4433aa" opacity="0.3"/>
          <!-- Capital (top decoration) -->
          <rect x="58" y="40" width="44" height="8" rx="2" fill="#6655cc" opacity="0.5"/>
          <rect x="55" y="36" width="50" height="6" rx="2" fill="#6655cc" opacity="0.4"/>
          <!-- Base -->
          <rect x="58" y="113" width="44" height="8" rx="2" fill="#6655cc" opacity="0.5"/>
          <rect x="55" y="119" width="50" height="6" rx="2" fill="#6655cc" opacity="0.4"/>
          <!-- Column lines -->
          <line x1="72" y1="48" x2="72" y2="113" stroke="#9988dd" stroke-width="0.8" opacity="0.2"/>
          <line x1="80" y1="48" x2="80" y2="113" stroke="#9988dd" stroke-width="0.8" opacity="0.25"/>
          <line x1="88" y1="48" x2="88" y2="113" stroke="#9988dd" stroke-width="0.8" opacity="0.2"/>
          <!-- Numeral -->
          <text x="80" y="90" text-anchor="middle" font-family="serif" font-size="24" font-weight="bold" fill="#9988dd" opacity="0.5">II</text>
        </svg>`;
      }
    },

    'mistralai/Mistral-Small-3.2-24B-Instruct-2506': {
      name: 'Mistral-Small-3.2',
      shortName: 'Mistral',
      title: 'THE WIND',
      accent: '#8899bb',
      accentBright: '#aabbdd',
      accentDim: '#556688',
      secondary: '#ccddf0',
      bg: [
        'radial-gradient(ellipse at 50% 30%, rgba(136,153,187,0.1) 0%, transparent 55%)',
        'radial-gradient(ellipse at 60% 75%, rgba(204,221,240,0.05) 0%, transparent 40%)',
        'linear-gradient(180deg, #0a0c10 0%, #10141c 35%, #0c1018 70%, #06080e 100%)',
      ].join(', '),
      patternSVG: `<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg"><path d="M0 40 Q20 30 40 40 Q60 50 80 40" stroke="rgba(136,153,187,0.03)" fill="none"/><path d="M0 60 Q20 50 40 60 Q60 70 80 60" stroke="rgba(136,153,187,0.02)" fill="none"/></svg>`,
      character() {
        return `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="80" r="72" fill="rgba(136,153,187,0.08)"/>
          <circle cx="80" cy="80" r="56" stroke="#8899bb" stroke-width="1" fill="none" opacity="0.15"/>
          <!-- Wind swirls -->
          <path d="M30 60 Q55 45 80 55 Q105 65 130 50" stroke="#8899bb" stroke-width="2.5" fill="none" opacity="0.5" stroke-linecap="round"/>
          <path d="M25 80 Q50 68 80 78 Q110 88 140 72" stroke="#aabbdd" stroke-width="2" fill="none" opacity="0.4" stroke-linecap="round"/>
          <path d="M35 100 Q58 88 80 95 Q102 102 125 90" stroke="#8899bb" stroke-width="1.5" fill="none" opacity="0.35" stroke-linecap="round"/>
          <!-- Spiral accent -->
          <path d="M105 45 Q115 42 118 50 Q121 58 112 60 Q103 62 100 54 Q98 48 105 45" stroke="#ccddf0" stroke-width="1" fill="none" opacity="0.4"/>
          <!-- Small wind dots -->
          <circle cx="130" cy="50" r="2" fill="#aabbdd" opacity="0.4"/>
          <circle cx="140" cy="72" r="1.5" fill="#aabbdd" opacity="0.35"/>
          <circle cx="125" cy="90" r="1.5" fill="#8899bb" opacity="0.3"/>
          <circle cx="25" cy="80" r="1.5" fill="#8899bb" opacity="0.3"/>
        </svg>`;
      }
    },

    'dphn/Dolphin-Mistral-24B-Venice-Edition': {
      name: 'Dolphin-Mistral-24B',
      shortName: 'Dolphin',
      title: 'THE DOLPHIN',
      accent: '#20b2aa',
      accentBright: '#48d1cc',
      accentDim: '#148880',
      secondary: '#7fffd4',
      bg: [
        'radial-gradient(ellipse at 50% 35%, rgba(32,178,170,0.12) 0%, transparent 55%)',
        'radial-gradient(ellipse at 65% 70%, rgba(127,255,212,0.06) 0%, transparent 40%)',
        'linear-gradient(180deg, #041210 0%, #081e1c 35%, #061816 70%, #030e0d 100%)',
      ].join(', '),
      patternSVG: `<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg"><path d="M10 50 Q40 30 70 50" stroke="rgba(32,178,170,0.03)" fill="none"/><circle cx="20" cy="65" r="1" fill="rgba(32,178,170,0.03)"/><circle cx="60" cy="35" r="1.2" fill="rgba(32,178,170,0.025)"/></svg>`,
      character() {
        return `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="80" r="72" fill="rgba(32,178,170,0.1)"/>
          <circle cx="80" cy="80" r="56" stroke="#20b2aa" stroke-width="1" fill="none" opacity="0.15"/>
          <!-- Dolphin body -->
          <path d="M40 85 Q45 60 70 55 Q85 52 95 58 Q110 48 115 42 Q108 55 100 60 Q115 68 120 85 Q115 100 95 105 Q80 108 65 100 Q50 95 40 85Z" fill="#20b2aa" opacity="0.7"/>
          <!-- Belly -->
          <path d="M55 88 Q65 95 85 98 Q100 95 110 88 Q100 100 80 102 Q60 100 55 88Z" fill="#48d1cc" opacity="0.3"/>
          <!-- Dorsal fin -->
          <path d="M75 55 Q78 38 85 35 Q82 48 85 52" fill="#148880" opacity="0.6"/>
          <!-- Tail -->
          <path d="M40 85 Q32 78 25 72 Q35 80 38 82" fill="#20b2aa" opacity="0.6"/>
          <path d="M40 85 Q32 92 25 98 Q35 90 38 88" fill="#20b2aa" opacity="0.5"/>
          <!-- Eye -->
          <circle cx="95" cy="62" r="3.5" fill="#7fffd4" opacity="0.9"/>
          <circle cx="95" cy="62" r="1.5" fill="#041210"/>
          <!-- Mouth line -->
          <path d="M105 68 Q112 72 118 75" stroke="#148880" stroke-width="1" fill="none" opacity="0.5"/>
          <!-- Smile -->
          <path d="M100 70 Q108 72 114 70" stroke="#48d1cc" stroke-width="0.8" fill="none" opacity="0.3"/>
          <!-- Water splashes -->
          <circle cx="35" cy="75" r="1.5" fill="#7fffd4" opacity="0.3"/>
          <circle cx="30" cy="95" r="1" fill="#48d1cc" opacity="0.25"/>
          <circle cx="125" cy="78" r="1.2" fill="#7fffd4" opacity="0.3"/>
        </svg>`;
      }
    },

    'featherless-ai/QRWKV-72B': {
      name: 'QRWKV-72B',
      shortName: 'QRWKV',
      title: 'THE RAVEN',
      accent: '#cc3333',
      accentBright: '#ee5555',
      accentDim: '#881818',
      secondary: '#ff8888',
      bg: [
        'radial-gradient(ellipse at 50% 30%, rgba(204,51,51,0.12) 0%, transparent 55%)',
        'radial-gradient(ellipse at 40% 75%, rgba(255,136,136,0.06) 0%, transparent 40%)',
        'linear-gradient(180deg, #140404 0%, #200808 35%, #180606 70%, #0e0303 100%)',
      ].join(', '),
      patternSVG: `<svg width="70" height="70" xmlns="http://www.w3.org/2000/svg"><path d="M15 55 L35 35 L55 55" stroke="rgba(204,51,51,0.03)" fill="none"/></svg>`,
      character() {
        return `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="80" r="72" fill="rgba(204,51,51,0.1)"/>
          <circle cx="80" cy="80" r="56" stroke="#cc3333" stroke-width="1" fill="none" opacity="0.15"/>
          <!-- Raven silhouette -->
          <path d="M50 90 Q45 70 55 55 Q65 42 80 40 Q95 42 105 55 Q110 62 108 72 L120 58 L115 72 Q118 80 110 90 Q100 105 80 108 Q60 105 50 90Z" fill="#cc3333" opacity="0.7"/>
          <!-- Wing -->
          <path d="M50 90 Q35 80 25 85 Q30 78 42 75 Q38 68 30 65 Q40 62 50 68" fill="#881818" opacity="0.5"/>
          <!-- Beak -->
          <path d="M108 72 L128 68 L115 78Z" fill="#ee5555" opacity="0.8"/>
          <!-- Eye -->
          <circle cx="100" cy="58" r="4" fill="#ff8888" opacity="0.9"/>
          <circle cx="100" cy="58" r="2" fill="#140404"/>
          <circle cx="99" cy="57" r="1" fill="#ffffff" opacity="0.3"/>
          <!-- Tail feathers -->
          <path d="M50 90 Q38 95 28 100" stroke="#cc3333" stroke-width="1.5" fill="none" opacity="0.4"/>
          <path d="M52 92 Q40 100 32 108" stroke="#cc3333" stroke-width="1.2" fill="none" opacity="0.3"/>
        </svg>`;
      }
    },

    'NousResearch/Hermes-4-70B': {
      name: 'Hermes-4-70B',
      shortName: 'Hermes',
      title: 'THE MESSENGER',
      accent: '#d4af37',
      accentBright: '#f0cc55',
      accentDim: '#997a20',
      secondary: '#ffe680',
      bg: [
        'radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.12) 0%, transparent 55%)',
        'radial-gradient(ellipse at 60% 75%, rgba(255,230,128,0.06) 0%, transparent 40%)',
        'linear-gradient(180deg, #120e04 0%, #1c1608 35%, #141006 70%, #0a0803 100%)',
      ].join(', '),
      patternSVG: `<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><path d="M20 10 L30 5 L40 10" stroke="rgba(212,175,55,0.04)" fill="none"/><path d="M20 50 L30 45 L40 50" stroke="rgba(212,175,55,0.03)" fill="none"/></svg>`,
      character() {
        return `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="80" r="72" fill="rgba(212,175,55,0.1)"/>
          <circle cx="80" cy="80" r="56" stroke="#d4af37" stroke-width="1" fill="none" opacity="0.15"/>
          <!-- Winged helmet -->
          <ellipse cx="80" cy="72" rx="24" ry="28" fill="#d4af37" opacity="0.3"/>
          <!-- Helmet dome -->
          <path d="M56 72 Q56 44 80 44 Q104 44 104 72" fill="#d4af37" opacity="0.5"/>
          <!-- Helmet brim -->
          <ellipse cx="80" cy="72" rx="28" ry="6" fill="#f0cc55" opacity="0.4"/>
          <!-- Left wing -->
          <path d="M52 62 Q38 48 30 35 Q36 50 40 55 Q32 42 25 32 Q34 48 42 58" fill="#d4af37" opacity="0.6"/>
          <!-- Right wing -->
          <path d="M108 62 Q122 48 130 35 Q124 50 120 55 Q128 42 135 32 Q126 48 118 58" fill="#d4af37" opacity="0.6"/>
          <!-- Face opening -->
          <ellipse cx="80" cy="78" rx="16" ry="12" fill="#120e04" opacity="0.5"/>
          <!-- Eyes in shadow -->
          <circle cx="74" cy="76" r="2.5" fill="#ffe680" opacity="0.7"/>
          <circle cx="86" cy="76" r="2.5" fill="#ffe680" opacity="0.7"/>
          <!-- Caduceus hint below -->
          <line x1="80" y1="95" x2="80" y2="125" stroke="#d4af37" stroke-width="1.5" opacity="0.3"/>
          <path d="M75 102 Q80 98 85 102 Q80 106 75 102" stroke="#f0cc55" stroke-width="0.8" fill="none" opacity="0.3"/>
          <path d="M75 112 Q80 108 85 112 Q80 116 75 112" stroke="#f0cc55" stroke-width="0.8" fill="none" opacity="0.3"/>
        </svg>`;
      }
    },

    'openai/gpt-oss-120b': {
      name: 'gpt-oss-120b',
      shortName: 'gpt-oss',
      title: 'THE ORACLE',
      accent: '#00ff88',
      accentBright: '#66ffaa',
      accentDim: '#009955',
      secondary: '#00cc66',
      bg: [
        'radial-gradient(ellipse at 50% 40%, rgba(0,255,136,0.1) 0%, transparent 55%)',
        'radial-gradient(ellipse at 60% 80%, rgba(0,204,102,0.05) 0%, transparent 35%)',
        'linear-gradient(180deg, #040d08 0%, #081a10 35%, #06140c 70%, #030a06 100%)',
      ].join(', '),
      patternSVG: `<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><text x="5" y="15" font-family="monospace" font-size="8" fill="rgba(0,255,136,0.03)">01</text><text x="25" y="35" font-family="monospace" font-size="8" fill="rgba(0,255,136,0.02)">10</text><text x="10" y="48" font-family="monospace" font-size="8" fill="rgba(0,255,136,0.025)">11</text></svg>`,
      character() {
        return `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="gp-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#00ff88" stop-opacity="0.25"/>
              <stop offset="70%" stop-color="#00ff88" stop-opacity="0.06"/>
              <stop offset="100%" stop-color="#00ff88" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="gp-eye" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#66ffaa"/>
              <stop offset="100%" stop-color="#009955"/>
            </radialGradient>
          </defs>
          <circle cx="80" cy="80" r="72" fill="url(#gp-glow)"/>
          <!-- Terminal frame -->
          <rect x="32" y="36" width="96" height="88" rx="6" stroke="#00ff88" stroke-width="1.5" fill="none" opacity="0.25"/>
          <rect x="36" y="40" width="88" height="80" rx="4" stroke="#00ff88" stroke-width="0.5" fill="none" opacity="0.12"/>
          <!-- All-seeing eye -->
          <ellipse cx="80" cy="76" rx="32" ry="18" fill="none" stroke="#00ff88" stroke-width="1.5" opacity="0.6"/>
          <circle cx="80" cy="76" r="12" fill="url(#gp-eye)" opacity="0.8"/>
          <circle cx="80" cy="76" r="5" fill="#040d08"/>
          <circle cx="77" cy="73" r="2" fill="#ffffff" opacity="0.4"/>
          <!-- Rays from eye -->
          <line x1="80" y1="52" x2="80" y2="42" stroke="#00ff88" stroke-width="0.8" opacity="0.3"/>
          <line x1="80" y1="100" x2="80" y2="110" stroke="#00ff88" stroke-width="0.8" opacity="0.3"/>
          <line x1="52" y1="68" x2="44" y2="62" stroke="#00ff88" stroke-width="0.8" opacity="0.25"/>
          <line x1="108" y1="68" x2="116" y2="62" stroke="#00ff88" stroke-width="0.8" opacity="0.25"/>
          <line x1="52" y1="84" x2="44" y2="90" stroke="#00ff88" stroke-width="0.8" opacity="0.25"/>
          <line x1="108" y1="84" x2="116" y2="90" stroke="#00ff88" stroke-width="0.8" opacity="0.25"/>
          <!-- Terminal text accents -->
          <text x="40" y="50" font-family="monospace" font-size="7" fill="#00ff88" opacity="0.25">$_</text>
          <text x="100" y="114" font-family="monospace" font-size="7" fill="#00ff88" opacity="0.2">EOF</text>
          <!-- Corner brackets -->
          <path d="M38 42 L38 48" stroke="#009955" stroke-width="1" opacity="0.3"/>
          <path d="M38 42 L44 42" stroke="#009955" stroke-width="1" opacity="0.3"/>
          <path d="M122 42 L122 48" stroke="#009955" stroke-width="1" opacity="0.3"/>
          <path d="M122 42 L116 42" stroke="#009955" stroke-width="1" opacity="0.3"/>
          <path d="M38 118 L38 112" stroke="#009955" stroke-width="1" opacity="0.3"/>
          <path d="M38 118 L44 118" stroke="#009955" stroke-width="1" opacity="0.3"/>
          <path d="M122 118 L122 112" stroke="#009955" stroke-width="1" opacity="0.3"/>
          <path d="M122 118 L116 118" stroke="#009955" stroke-width="1" opacity="0.3"/>
        </svg>`;
      }
    }
  };

  // Fallback theme for unknown models
  const defaultTheme = {
    name: 'Unknown',
    shortName: '???',
    title: 'THE UNKNOWN',
    accent: '#9a9ab0',
    accentBright: '#c8c8d8',
    accentDim: '#606076',
    secondary: '#d4d4e4',
    bg: [
      'radial-gradient(ellipse at 50% 30%, rgba(160,160,180,0.06) 0%, transparent 50%)',
      'linear-gradient(180deg, #0c0c0f 0%, #101014 50%, #0c0c0f 100%)',
    ].join(', '),
    patternSVG: '',
    character() {
      return `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="uk-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#9a9ab0" stop-opacity="0.15"/>
            <stop offset="100%" stop-color="#9a9ab0" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="80" cy="80" r="72" fill="url(#uk-glow)"/>
        <circle cx="80" cy="80" r="40" stroke="#9a9ab0" stroke-width="1.5" fill="none" opacity="0.2"/>
        <text x="80" y="88" text-anchor="middle" font-family="monospace" font-size="28" fill="#9a9ab0" opacity="0.6">?</text>
      </svg>`;
    }
  };

  return {
    getTheme(modelId) {
      return themes[modelId] || defaultTheme;
    },
    getDefault() {
      return defaultTheme;
    }
  };

})();

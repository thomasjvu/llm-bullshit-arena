// LLM Bullshit - Game Visualizer
// Step-by-step card game with visible hands and LLM thoughts

// ─── Sound Effects (Web Audio API) ───────────────────────────────────

const SoundFX = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Brownian (red) noise — sounds warmer/more physical than white noise
  function createBrownNoise(duration) {
    const ac = getCtx();
    const len = ac.sampleRate * duration;
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const src = ac.createBufferSource();
    src.buffer = buf;
    return src;
  }

  function createNoise(duration) {
    const ac = getCtx();
    const buf = ac.createBuffer(1, ac.sampleRate * duration, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buf;
    return src;
  }

  // Single card flick — short filtered brown noise snap
  function cardFlickSound(ac, time, volume) {
    const noise = createBrownNoise(0.08);
    const gain = ac.createGain();
    const lp = ac.createBiquadFilter();
    const hp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(6000, time);
    lp.frequency.exponentialRampToValueAtTime(800, time + 0.06);
    hp.type = 'highpass';
    hp.frequency.value = 300;
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
    noise.connect(hp).connect(lp).connect(gain).connect(ac.destination);
    noise.start(time);
    noise.stop(time + 0.08);
  }

  return {
    // Card sliding onto table — a soft thwip with body
    playCard() {
      const ac = getCtx();
      const now = ac.currentTime;
      // Initial snap transient
      cardFlickSound(ac, now, 0.4);
      // Soft tonal body — very short sine thud for table impact
      const thud = ac.createOscillator();
      const thudGain = ac.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(180, now + 0.01);
      thud.frequency.exponentialRampToValueAtTime(60, now + 0.08);
      thudGain.gain.setValueAtTime(0.001, now);
      thudGain.gain.linearRampToValueAtTime(0.12, now + 0.012);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      thud.connect(thudGain).connect(ac.destination);
      thud.start(now);
      thud.stop(now + 0.1);
    },

    // Challenge call — dramatic "record scratch" burst
    challenge() {
      const ac = getCtx();
      const now = ac.currentTime;
      // Quick descending noise sweep (like a record scratch)
      const scratch = createBrownNoise(0.25);
      const scratchGain = ac.createGain();
      const scratchBP = ac.createBiquadFilter();
      scratchBP.type = 'bandpass';
      scratchBP.frequency.setValueAtTime(4000, now);
      scratchBP.frequency.exponentialRampToValueAtTime(600, now + 0.2);
      scratchBP.Q.value = 3;
      scratchGain.gain.setValueAtTime(0.001, now);
      scratchGain.gain.linearRampToValueAtTime(0.35, now + 0.01);
      scratchGain.gain.setValueAtTime(0.25, now + 0.08);
      scratchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      scratch.connect(scratchBP).connect(scratchGain).connect(ac.destination);
      scratch.start(now);
      scratch.stop(now + 0.25);
      // Dramatic low hit
      const hit = ac.createOscillator();
      const hitGain = ac.createGain();
      hit.type = 'sine';
      hit.frequency.setValueAtTime(100, now + 0.02);
      hit.frequency.exponentialRampToValueAtTime(35, now + 0.2);
      hitGain.gain.setValueAtTime(0.001, now);
      hitGain.gain.linearRampToValueAtTime(0.3, now + 0.025);
      hitGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      hit.connect(hitGain).connect(ac.destination);
      hit.start(now);
      hit.stop(now + 0.25);
    },

    // Caught the lie — triumphant rising two-tone sting
    challengeCorrect() {
      const ac = getCtx();
      const now = ac.currentTime;
      // Two bright rising notes
      [523, 784].forEach((freq, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const lp = ac.createBiquadFilter();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        lp.type = 'lowpass';
        lp.frequency.value = 4000;
        const t = now + i * 0.12;
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
        gain.gain.setValueAtTime(0.2, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(lp).connect(gain).connect(ac.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      });
      // Bright noise accent
      const accent = createNoise(0.08);
      const accentGain = ac.createGain();
      const accentHP = ac.createBiquadFilter();
      accentHP.type = 'highpass';
      accentHP.frequency.value = 5000;
      accentGain.gain.setValueAtTime(0.001, now + 0.12);
      accentGain.gain.linearRampToValueAtTime(0.08, now + 0.125);
      accentGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      accent.connect(accentHP).connect(accentGain).connect(ac.destination);
      accent.start(now + 0.12);
      accent.stop(now + 0.2);
    },

    // Wrong call — sad descending two-tone + buzz
    challengeWrong() {
      const ac = getCtx();
      const now = ac.currentTime;
      // Two descending tones (minor feel)
      [392, 233].forEach((freq, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const lp = ac.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.2);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.9, now + i * 0.2 + 0.25);
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(1200, now + i * 0.2);
        lp.frequency.exponentialRampToValueAtTime(300, now + i * 0.2 + 0.3);
        lp.Q.value = 2;
        const t = now + i * 0.2;
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
        gain.gain.setValueAtTime(0.1, t + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(lp).connect(gain).connect(ac.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    },

    // Win — warm ascending chord with shimmer
    win() {
      const ac = getCtx();
      const now = ac.currentTime;
      // C major arpeggio with soft attack
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const lp = ac.createBiquadFilter();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        lp.type = 'lowpass';
        lp.frequency.value = 3000;
        const t = now + i * 0.1;
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.03);
        gain.gain.setValueAtTime(0.15, t + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.connect(lp).connect(gain).connect(ac.destination);
        osc.start(t);
        osc.stop(t + 0.5);
      });
      // Shimmer noise tail
      const shimmer = createNoise(0.4);
      const shimGain = ac.createGain();
      const shimBP = ac.createBiquadFilter();
      shimBP.type = 'bandpass';
      shimBP.frequency.value = 6000;
      shimBP.Q.value = 3;
      shimGain.gain.setValueAtTime(0.001, now + 0.3);
      shimGain.gain.linearRampToValueAtTime(0.04, now + 0.35);
      shimGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      shimmer.connect(shimBP).connect(shimGain).connect(ac.destination);
      shimmer.start(now + 0.3);
      shimmer.stop(now + 0.7);
    },

    // Single card flick sound (for deal animation)
    cardFlick() {
      const ac = getCtx();
      cardFlickSound(ac, ac.currentTime, 0.15 + Math.random() * 0.15);
    },

    // Deal/shuffle — rapid sequence of card flicks
    deal() {
      const ac = getCtx();
      const now = ac.currentTime;
      for (let i = 0; i < 7; i++) {
        const t = now + i * 0.055;
        const vol = 0.15 + Math.random() * 0.15;
        cardFlickSound(ac, t, vol);
      }
    }
  };
})();

// ─── Card Flight Animations ──────────────────────────────────────────

function animateCardsToTarget(sourceEl, targetEl, count, onDone) {
  if (!sourceEl || !targetEl || count <= 0) {
    if (onDone) onDone();
    return;
  }

  const srcRect = sourceEl.getBoundingClientRect();
  const tgtRect = targetEl.getBoundingClientRect();
  let completed = 0;

  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'flying-card';
    card.innerHTML = window.CardRenderer.getCardBackSVG();

    // Start position
    card.style.left = srcRect.left + srcRect.width / 2 - 22 + 'px';
    card.style.top = srcRect.top + srcRect.height / 2 - 31 + 'px';
    card.style.transform = `rotate(${(Math.random() - 0.5) * 15}deg)`;
    document.body.appendChild(card);

    // Trigger reflow, then animate
    setTimeout(() => {
      card.style.left = tgtRect.left + tgtRect.width / 2 - 22 + (Math.random() - 0.5) * 20 + 'px';
      card.style.top = tgtRect.top + tgtRect.height / 2 - 31 + (Math.random() - 0.5) * 10 + 'px';
      card.style.transform = `rotate(${(Math.random() - 0.5) * 30}deg)`;
      card.style.opacity = '0.7';
    }, 20 + i * 80);

    // Remove after animation
    setTimeout(() => {
      card.remove();
      completed++;
      if (completed === count && onDone) onDone();
    }, 420 + i * 80);
  }
}

// ─── Deal Animation — cards fly from center to each player ──────────

function animateDeal(state) {
  if (!state.players) return;
  const totalCards = state.players.reduce((sum, p) => sum + (p.handSize || 0), 0);
  if (totalCards === 0) return;

  const playerCount = state.players.length;
  // Deal cards round-robin to each player, one at a time
  let cardIndex = 0;
  const cardsPerPlayer = [];
  state.players.forEach(p => cardsPerPlayer.push(p.handSize || 0));

  // Build deal sequence: round-robin until all cards dealt
  const dealOrder = [];
  let maxCards = Math.max(...cardsPerPlayer);
  for (let round = 0; round < maxCards; round++) {
    for (let p = 0; p < playerCount; p++) {
      if (round < cardsPerPlayer[p]) {
        dealOrder.push(p);
      }
    }
  }

  const stagger = 60; // ms between each card
  dealOrder.forEach((playerIdx, i) => {
    setTimeout(() => {
      const handEl = document.querySelector(`.player-hand[data-hand="${playerIdx}"]`);
      const infoEl = document.querySelector(`.player-info[data-player="${playerIdx}"]`);
      const targetEl = handEl || infoEl;
      if (targetEl) {
        animateCardsToTarget(pileDisplay, targetEl, 1);
        SoundFX.cardFlick();
      }
    }, i * stagger);
  });
}

// ─── BS Callout Text Effect (codepen crowd style) ───────────────────

const BS_CALL_WORDS = ['BULLSHIT!', 'LIAR!!', 'NO WAY!', 'BS!!!', 'FAKE!!'];
const BS_CORRECT_WORDS = ['GOTCHA!', 'BUSTED!!', 'CAUGHT!', 'EXPOSED!'];
const BS_WRONG_WORDS = ['WRONG!', 'OOPS!!', 'NOPE!', 'FAIL!'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Show a single callout word near the target with codepen perspective warp
function showBSCallout(targetEl, text, cssClass) {
  if (!targetEl) return;
  const rect = targetEl.getBoundingClientRect();

  const el = document.createElement('div');
  el.className = `bs-callout pos-a ${cssClass}`;
  el.textContent = text;

  // Position above and to the left of the player
  el.style.position = 'fixed';
  el.style.left = (rect.left + rect.width / 2 - 80) + 'px';
  el.style.top = (rect.top - 30) + 'px';

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}

function showChallengeCallout(challengerEl, isCorrect) {
  // Initial "BULLSHIT!" callout
  showBSCallout(challengerEl, pick(BS_CALL_WORDS), 'bs-call');

  // Delayed result callout with its own sound
  setTimeout(() => {
    if (isCorrect) {
      SoundFX.challengeCorrect();
      showBSCallout(challengerEl, pick(BS_CORRECT_WORDS), 'bs-correct');
    } else {
      SoundFX.challengeWrong();
      showBSCallout(challengerEl, pick(BS_WRONG_WORDS), 'bs-wrong');
    }
  }, 900);
}

// ─── App State & Constants ───────────────────────────────────────────

const API_BASE = 'http://localhost:3001/api';

let currentGameId = null;
let autoPlayAbort = null;
let isAutoPlaying = false;
let previousState = null;

// DOM Elements
const newGameBtn = document.getElementById('new-game-btn');
const autoPlayBtn = document.getElementById('auto-play-btn');
const stepBtn = document.getElementById('step-btn');
const experimentSelect = document.getElementById('experiment-select');
const thoughtLog = document.getElementById('thought-log');
const pileDisplay = document.getElementById('pile-display');
const pendingDisplay = document.getElementById('pending-display');
const currentRankDisplay = document.getElementById('current-rank');
const gamePhaseDisplay = document.getElementById('game-phase');
const winnerOverlay = document.getElementById('winner-overlay');
const winnerName = document.getElementById('winner-name');

// Helpers
function shortenModelName(name) {
  if (!name) return '???';
  const parts = name.split('/');
  const full = parts[parts.length - 1];
  return full.length > 14 ? full.substring(0, 12) + '…' : full;
}

function createCardElement(cardStr, showFace = true) {
  const div = document.createElement('div');
  div.className = 'card-mini';
  div.innerHTML = showFace
    ? window.CardRenderer.getCardSVG(cardStr)
    : window.CardRenderer.getCardBackSVG();
  return div;
}

// Initialize game
newGameBtn.addEventListener('click', startNewGame);
autoPlayBtn.addEventListener('click', toggleAutoPlay);
stepBtn.addEventListener('click', stepGame);

async function startNewGame() {
  const experimentId = parseInt(experimentSelect.value);

  try {
    newGameBtn.disabled = true;
    previousState = null;

    const response = await fetch(`${API_BASE}/game/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ experimentId })
    });

    const data = await response.json();
    currentGameId = data.gameId;

    // Enable controls
    autoPlayBtn.disabled = false;
    stepBtn.disabled = false;

    // Clear thought log
    thoughtLog.innerHTML = '<div class="empty-thought">game started! click step or auto to begin...</div>';

    // Update UI first so player positions are rendered
    renderGameState(data);

    // Animate cards dealing from center pile to each player
    animateDeal(data);

  } catch (error) {
    console.error('Failed to start game:', error);
    newGameBtn.disabled = false;
  }
}

async function stepGame() {
  if (!currentGameId) return;

  try {
    stepBtn.disabled = true;

    const response = await fetch(`${API_BASE}/game/${currentGameId}/step`, {
      method: 'POST'
    });

    const data = await response.json();

    if (data.error) {
      console.error('Step error:', data.error, data.details);
      logError(data.error, data.details);
      stepBtn.disabled = false;
      return;
    }

    if (data.stepInProgress) {
      console.log('Step already in progress, waiting...');
      stepBtn.disabled = false;
      return;
    }

    renderGameState(data);

    if (data.phase !== 'finished') {
      stepBtn.disabled = false;
    }

  } catch (error) {
    console.error('Step failed:', error);
    logError('Network error', error.message);
    stepBtn.disabled = false;
  }
}

function toggleAutoPlay() {
  if (isAutoPlaying) {
    stopAutoPlay();
  } else {
    startAutoPlay();
  }
}

async function startAutoPlay() {
  isAutoPlaying = true;
  autoPlayAbort = new AbortController();
  autoPlayBtn.textContent = '⏹ stop';
  autoPlayBtn.classList.add('cute');
  stepBtn.disabled = true;

  const signal = autoPlayAbort.signal;

  let consecutiveErrors = 0;

  while (isAutoPlaying && currentGameId) {
    try {
      const response = await fetch(`${API_BASE}/game/${currentGameId}/step`, {
        method: 'POST',
        signal
      });

      if (!isAutoPlaying) break;

      const data = await response.json();

      if (data.stepInProgress) {
        // Step already running, wait and retry
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }

      if (data.error) {
        consecutiveErrors++;
        console.error(`Auto step error (${consecutiveErrors}):`, data.error, data.details);
        logError(`API error (attempt ${consecutiveErrors})`, data.details || data.error);
        if (consecutiveErrors >= 5) {
          logError('Giving up', 'Too many consecutive errors');
          break;
        }
        // Wait longer between retries
        await new Promise(r => setTimeout(r, 3000 * consecutiveErrors));
        continue;
      }

      consecutiveErrors = 0;
      renderGameState(data);

      if (data.phase === 'finished') {
        break;
      }

      // Brief pause between steps for animation breathing room
      await new Promise(r => setTimeout(r, 600));
    } catch (error) {
      if (error.name === 'AbortError') break;
      consecutiveErrors++;
      console.error(`Auto step failed (${consecutiveErrors}):`, error);
      if (consecutiveErrors >= 5) {
        logError('Giving up', 'Too many consecutive network errors');
        break;
      }
      logError(`Network error (attempt ${consecutiveErrors})`, error.message);
      await new Promise(r => setTimeout(r, 3000 * consecutiveErrors));
    }
  }

  stopAutoPlay();
}

function stopAutoPlay() {
  isAutoPlaying = false;
  autoPlayBtn.textContent = '▶ auto';
  autoPlayBtn.classList.remove('cute');
  stepBtn.disabled = false;

  if (autoPlayAbort) {
    autoPlayAbort.abort();
    autoPlayAbort = null;
  }
}

function logError(title, detail) {
  const entry = document.createElement('div');
  entry.className = 'turn-entry';
  entry.innerHTML = `<div class="turn-line" style="color: #ff6b6b;">❌ ${title}</div>` +
    (detail ? `<div class="turn-thought" style="color: #ff6b6b;">${detail}</div>` : '');
  thoughtLog.insertBefore(entry, thoughtLog.firstChild);
  gamePhaseDisplay.textContent = '❌ error — check log';
}

function renderGameState(state) {
  // ── Diff previous state to detect events ──
  const prevTurnCount = previousState?.turns?.length || 0;
  const newTurnCount = state.turns?.length || 0;
  const newTurn = newTurnCount > prevTurnCount ? state.turns[newTurnCount - 1] : null;

  const hadPending = previousState?.pendingTurn != null;
  const hasPending = state.pendingTurn != null;
  const pendingJustAppeared = !hadPending && hasPending;
  const pendingJustResolved = hadPending && !hasPending && newTurn;

  // Determine which player played and find their DOM position
  let activePlayerIndex = null;
  const playerId = newTurn?.playerId || state.pendingTurn?.playerId;
  if (playerId) {
    activePlayerIndex = state.players.findIndex(p => p.id === playerId);
  }

  // ── Sound effects + BS callouts based on state diff ──
  if (pendingJustAppeared) {
    // Cards just played — play card sound and fly cards to pending area
    SoundFX.playCard();
    if (activePlayerIndex !== null && activePlayerIndex >= 0) {
      const handEl = document.querySelector(`.player-hand[data-hand="${activePlayerIndex}"]`);
      const infoEl = document.querySelector(`.player-info[data-player="${activePlayerIndex}"]`);
      const sourceEl = handEl && handEl.children.length > 0 ? handEl : infoEl;
      const cardCount = state.pendingTurn.actualCards?.length || state.pendingTurn.claimedCount || 1;
      animateCardsToTarget(sourceEl, pendingDisplay, cardCount);
    }
  }

  if (pendingJustResolved) {
    if (newTurn.challenged) {
      SoundFX.challenge();
      const challengerIndex = state.players.findIndex(p => p.id === newTurn.challengerId);
      const challengerEl = document.querySelector(`.player-info[data-player="${challengerIndex}"]`);
      showChallengeCallout(challengerEl, newTurn.challengeCorrect);

      // Flip cards face-up in pending area, then animate to destination
      flipPendingCards(newTurn, state);
    } else {
      // No challenge — flip cards and send to pile
      flipPendingCards(newTurn, state);
    }
  }

  if (state.winner && state.phase === 'finished' && !previousState?.winner) {
    setTimeout(() => SoundFX.win(), 300);
  }

  // ── Update players ──
  const thinkingId = state.thinkingPlayerId || null;

  state.players.forEach((player, i) => {
    const infoEl = document.querySelector(`.player-info[data-player="${i}"]`);
    const handEl = document.querySelector(`.player-hand[data-hand="${i}"]`);

    if (infoEl) {
      infoEl.querySelector('.player-name').textContent = shortenModelName(player.modelId);
      infoEl.querySelector('.card-count span').textContent = player.handSize;

      const isThinking = player.id === thinkingId;
      const isChallengePhase = state.phase === 'challenging';
      const isWinner = state.winner === player.id;

      infoEl.classList.toggle('active', player.isActive && !isThinking);
      infoEl.classList.toggle('thinking', isThinking && !isChallengePhase);
      infoEl.classList.toggle('challenging', isThinking && isChallengePhase);
      infoEl.classList.toggle('winner', isWinner);

      // Update status label
      const statusEl = infoEl.querySelector('.player-status');
      if (statusEl) {
        if (isWinner) {
          statusEl.textContent = '🏆 winner!';
          statusEl.className = 'player-status';
        } else if (isThinking && isChallengePhase) {
          statusEl.textContent = '🤔 judging...';
          statusEl.className = 'player-status status-challenging';
        } else if (isThinking && !isChallengePhase) {
          statusEl.textContent = '💭 thinking...';
          statusEl.className = 'player-status status-thinking';
        } else if (player.isActive && isChallengePhase) {
          statusEl.textContent = '😬 awaiting verdict';
          statusEl.className = 'player-status status-challenging';
        } else {
          statusEl.textContent = '';
          statusEl.className = 'player-status';
        }
      }
    }

    if (handEl) {
      handEl.innerHTML = '';
      if (player.hand && player.hand.length > 0) {
        player.hand.forEach(cardStr => {
          handEl.appendChild(createCardElement(cardStr, true));
        });
      }
    }
  });

  // Update pile
  pileDisplay.innerHTML = '';
  const pileSize = state.pileSize || 0;
  const cardsToShow = Math.min(pileSize, 3);
  for (let i = 0; i < cardsToShow; i++) {
    pileDisplay.appendChild(createCardElement('back', false));
  }
  document.querySelector('.pile-count').textContent = pileSize;

  // Update pending cards (face-down during challenge phase)
  if (hasPending && !pendingJustResolved) {
    renderPendingCards(state.pendingTurn);
  } else if (!hasPending) {
    // Clear pending area (unless flipPendingCards is animating — it cleans up itself)
    if (!pendingJustResolved) {
      pendingDisplay.innerHTML = '';
    }
  }

  // Show pending turn reasoning immediately when it appears
  if (pendingJustAppeared && state.pendingTurn) {
    renderPendingTurnLog(state.pendingTurn, state.players);
  }

  // Update current rank
  currentRankDisplay.textContent = state.currentRank || 'A';

  // Update phase display with model names
  if (state.phase === 'finished') {
    gamePhaseDisplay.innerHTML = '🎉 game over!';
  } else if (state.phase === 'waiting' && thinkingId) {
    const thinkingPlayer = state.players.find(p => p.id === thinkingId);
    const name = shortenModelName(thinkingPlayer?.modelId);
    gamePhaseDisplay.innerHTML = `<span class="phase-model">${name}</span><span class="phase-action">choosing cards to play...</span>`;
  } else if (state.phase === 'challenging' && thinkingId) {
    const thinkingPlayer = state.players.find(p => p.id === thinkingId);
    const name = shortenModelName(thinkingPlayer?.modelId);
    gamePhaseDisplay.innerHTML = `<span class="phase-model">${name}</span><span class="phase-action">deciding whether to call BS...</span>`;
  } else if (state.phase === 'challenging') {
    gamePhaseDisplay.innerHTML = '⚡ challenge phase...';
  } else {
    gamePhaseDisplay.innerHTML = '🎯 waiting for play...';
  }

  // Update turn log
  if (state.turns && state.turns.length > 0) {
    renderTurnLog(state.turns, state.players);
  }

  // Handle winner
  if (state.winner && state.phase === 'finished') {
    const winner = state.players.find(p => p.id === state.winner);
    showWinner(winner);
  }

  // Save for next diff
  previousState = JSON.parse(JSON.stringify(state));
}

// ─── Pending Cards (face-down / flip reveal) ─────────────────────────

function renderPendingCards(pendingTurn) {
  if (!pendingTurn) {
    pendingDisplay.innerHTML = '';
    return;
  }

  // Only re-render if the pending display is empty (avoid re-rendering on every state update)
  if (pendingDisplay.children.length > 0) return;

  const cardCount = pendingTurn.actualCards?.length || pendingTurn.claimedCount || 1;
  const actualCards = pendingTurn.actualCards || [];

  for (let i = 0; i < cardCount; i++) {
    const wrapper = document.createElement('div');
    wrapper.className = 'pending-card-wrapper';

    const inner = document.createElement('div');
    inner.className = 'pending-card-inner';

    // Back face (visible by default)
    const back = document.createElement('div');
    back.className = 'pending-card-back';
    back.innerHTML = window.CardRenderer.getCardBackSVG();

    // Front face (hidden, shown on flip)
    const front = document.createElement('div');
    front.className = 'pending-card-front';
    if (actualCards[i]) {
      const cardStr = actualCards[i].rank + actualCards[i].suit;
      front.innerHTML = window.CardRenderer.getCardSVG(cardStr);
    } else {
      front.innerHTML = window.CardRenderer.getCardBackSVG();
    }

    inner.appendChild(back);
    inner.appendChild(front);
    wrapper.appendChild(inner);
    pendingDisplay.appendChild(wrapper);
  }
}

function renderPendingTurnLog(pendingTurn, players) {
  const player = players.find(p => p.id === pendingTurn.playerId);
  const playerName = shortenModelName(player?.modelId);
  const num = '?';

  const entry = document.createElement('div');
  entry.className = 'turn-entry pending-entry';
  entry.dataset.pendingPlayerId = pendingTurn.playerId;

  let html = `<div class="turn-line"><span class="turn-number">#${num}</span>  <span class="turn-player">${playerName}</span>  <span class="turn-action">→ ${pendingTurn.claimedCount}× ${pendingTurn.claimedRank}</span>  <span class="badge-pending">awaiting...</span></div>`;

  if (pendingTurn.reasoning && pendingTurn.reasoning !== 'No reasoning provided') {
    const shortened = pendingTurn.reasoning.length > 120
      ? pendingTurn.reasoning.substring(0, 117) + '...'
      : pendingTurn.reasoning;
    html += `<div class="turn-thought">"${shortened}"</div>`;
  }

  entry.innerHTML = html;
  thoughtLog.insertBefore(entry, thoughtLog.firstChild);
}

function flipPendingCards(resolvedTurn, state) {
  const cards = pendingDisplay.querySelectorAll('.pending-card-inner');
  if (cards.length === 0) {
    pendingDisplay.innerHTML = '';
    return;
  }

  // Flip all cards face-up with stagger
  cards.forEach((card, i) => {
    setTimeout(() => card.classList.add('flipped'), i * 100);
  });

  // After flip completes, animate cards to destination then clean up
  const flipDuration = 500 + (cards.length - 1) * 100;

  setTimeout(() => {
    if (resolvedTurn.challenged) {
      // Fly cards to the loser
      const loserId = resolvedTurn.challengeCorrect ? resolvedTurn.playerId : resolvedTurn.challengerId;
      const loserIndex = state.players.findIndex(p => p.id === loserId);
      const loserHand = document.querySelector(`.player-hand[data-hand="${loserIndex}"]`);
      const loserInfo = document.querySelector(`.player-info[data-player="${loserIndex}"]`);
      const loserEl = loserHand || loserInfo;
      // Fly pending cards + pile cards to loser
      const totalCards = Math.min(cards.length + (previousState?.pileSize || 0), 6);
      animateCardsToTarget(pendingDisplay, loserEl, totalCards, () => {
        pendingDisplay.innerHTML = '';
      });
    } else {
      // Fly cards to pile
      animateCardsToTarget(pendingDisplay, pileDisplay, cards.length, () => {
        pendingDisplay.innerHTML = '';
      });
    }
  }, flipDuration + 200);

  // Remove pending entry from thought log and replace with final entry
  const pendingEntry = thoughtLog.querySelector('.pending-entry');
  if (pendingEntry) pendingEntry.remove();
}

// ─── Minimal Turn Log ────────────────────────────────────────────────

function renderTurnLog(turns, players) {
  const existingCount = thoughtLog.querySelectorAll('.turn-entry').length;

  if (existingCount === 0) {
    thoughtLog.innerHTML = '';
  }

  for (let i = existingCount; i < turns.length; i++) {
    const turn = turns[i];
    const player = players.find(p => p.id === turn.playerId);
    const playerName = shortenModelName(player?.modelId);

    const entry = document.createElement('div');
    entry.className = 'turn-entry';

    const num = turn.turnNumber || i + 1;
    const badge = turn.wasLie
      ? '<span class="badge-lie">lie</span>'
      : '<span class="badge-truth">truth</span>';

    let html = `<div class="turn-line"><span class="turn-number">#${num}</span>  <span class="turn-player">${playerName}</span>  <span class="turn-action">→ ${turn.claimedCount}× ${turn.claimedRank}</span>  ${badge}</div>`;

    if (turn.reasoning && turn.reasoning !== 'No reasoning provided') {
      const shortened = turn.reasoning.length > 120
        ? turn.reasoning.substring(0, 117) + '...'
        : turn.reasoning;
      html += `<div class="turn-thought">"${shortened}"</div>`;
    }

    if (turn.challenged) {
      const challenger = players.find(p => p.id === turn.challengerId);
      const challengerName = shortenModelName(challenger?.modelId);
      const resultClass = turn.challengeCorrect ? 'challenge-correct' : 'challenge-wrong';
      const resultText = turn.challengeCorrect ? 'caught it!' : 'wrong call!';
      html += `<div class="challenge-line ${resultClass}">⚡ ${challengerName} called BS — ${resultText}</div>`;

      if (turn.challengeReasoning) {
        const shortened = turn.challengeReasoning.length > 120
          ? turn.challengeReasoning.substring(0, 117) + '...'
          : turn.challengeReasoning;
        html += `<div class="turn-thought">"${shortened}"</div>`;
      }
    }

    entry.innerHTML = html;
    thoughtLog.insertBefore(entry, thoughtLog.firstChild);
  }
}

function showWinner(player) {
  winnerName.textContent = shortenModelName(player?.modelId);
  winnerOverlay.style.display = 'flex';

  // Disable controls
  stopAutoPlay();
  autoPlayBtn.disabled = true;
  stepBtn.disabled = true;
  newGameBtn.disabled = false;
}

// Close winner overlay and reset
document.querySelector('.winner-overlay .btn').addEventListener('click', () => {
  winnerOverlay.style.display = 'none';
  currentGameId = null;
});

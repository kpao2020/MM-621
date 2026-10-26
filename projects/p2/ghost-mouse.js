/*
  Project 2: Spooky Weather
  Cursor ghost and playful card-click effects.

  Description:
    - Draws a ghost that eases toward the mouse pointer.
    - Shows a brief Boo effect and plays a synthesized creak when a card is clicked.

  References:
    - P5.js: https://p5js.org/reference/
    - Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
    - OpenAI ChatGPT for code assistance and optimization suggestions.

  Code Origin:
    - [AI-ASSISTED FEATURE] For a cursor ghost image and card-click effects;
      its shape follows mouse cursor positioning.
*/

// ============================================================
// GHOST AND CLICK EFFECT STATE
// ============================================================
let ghostX = 0;
let ghostY = 0;
let booUntil = 0;
let booEmoji = '🎃';
let spookyAudioContext = null;

// ============================================================
// DRAW FLOATING GHOST
// - Ease a tiny ghost toward the pointer so it drifts across the dashboard.
// ============================================================
function drawFloatingGhost() {
  // Adjust these dimensions and offsets to customize the cursor-following ghost.
  const GHOST_WIDTH = 34;
  const GHOST_HEIGHT = 38;
  const EYE_OFFSET_X = 6;
  const EYE_OFFSET_Y = -3;
  const TARGET_X = constrain(mouseX, 18, width - 18);
  const TARGET_Y = constrain(mouseY, 18, height - 18);
  ghostX = lerp(ghostX || TARGET_X, TARGET_X, 0.075);
  ghostY = lerp(ghostY || TARGET_Y, TARGET_Y, 0.075);

  push();
  noStroke();
  fill(244, 242, 232);
  // A solid body polygon gives the ghost one clean animated hem.
  const BODY_LEFT = ghostX - GHOST_WIDTH / 2;
  const BODY_RIGHT = ghostX + GHOST_WIDTH / 2;
  const WAVE_SEGMENTS = 12;
  // Draw the round crown first; the moving body redraws its lower edge as a wave.
  ellipse(ghostX, ghostY - 5, GHOST_WIDTH, GHOST_HEIGHT * 0.82);
  beginShape();
  vertex(BODY_LEFT, ghostY - 5);
  for (let i = 0; i <= WAVE_SEGMENTS; i++) {
    const X = BODY_LEFT + (GHOST_WIDTH * i) / WAVE_SEGMENTS;
    const WAVE_Y = ghostY + 7 + sin(frameCount * 0.035 + i * 0.55) * 2;
    vertex(X, WAVE_Y);
  }
  vertex(BODY_RIGHT, ghostY - 5);
  endShape(CLOSE);

  // ghost 2 eyes.
  fill(37, 34, 54, 220);
  ellipse(ghostX - EYE_OFFSET_X, ghostY + EYE_OFFSET_Y, 4, 6);
  ellipse(ghostX + EYE_OFFSET_X, ghostY + EYE_OFFSET_Y, 4, 6);
  pop();
}

// ============================================================
// DRAW BOO EFFECT
// - Keep the playful click surprise visible for one second.
// ============================================================
function drawBooEffect() {
  if (millis() >= booUntil) return;
  push();
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(30);
  fill(255, 226, 173, 245);
  text(`BOO! ${booEmoji}`, constrain(mouseX + 24, 8, width - 145), constrain(mouseY - 30, 22, height - 20));
  pop();
}

// ============================================================
// PLAY CREEPY CREAK
// - Synthesize a short descending creak on a user click without an audio file.
// ============================================================
async function playCreak() {
  const AUDIO_CONTEXT_CLASS = window.AudioContext || window.webkitAudioContext;
  if (!AUDIO_CONTEXT_CLASS) return;
  try {
    // Resume the context from this click gesture before scheduling any sound.
    if (!spookyAudioContext) spookyAudioContext = new AUDIO_CONTEXT_CLASS();
    if (spookyAudioContext.state === 'suspended') await spookyAudioContext.resume();
    const CONTEXT = spookyAudioContext;
    if (CONTEXT.state !== 'running') return;

    const OSCILLATOR = CONTEXT.createOscillator();
    const GAIN = CONTEXT.createGain();
    const FILTER = CONTEXT.createBiquadFilter();
    const NOW = CONTEXT.currentTime;

    OSCILLATOR.type = 'sawtooth';
    OSCILLATOR.frequency.setValueAtTime(420, NOW);
    OSCILLATOR.frequency.exponentialRampToValueAtTime(125, NOW + 0.42);
    FILTER.type = 'lowpass';
    FILTER.frequency.setValueAtTime(1100, NOW);
    FILTER.frequency.exponentialRampToValueAtTime(380, NOW + 0.42);
    GAIN.gain.setValueAtTime(0.0001, NOW);
    GAIN.gain.exponentialRampToValueAtTime(0.055, NOW + 0.035);
    GAIN.gain.exponentialRampToValueAtTime(0.0001, NOW + 0.45);

    OSCILLATOR.connect(FILTER);
    FILTER.connect(GAIN);
    GAIN.connect(CONTEXT.destination);
    OSCILLATOR.start(NOW);
    OSCILLATOR.stop(NOW + 0.46);
  } catch (error) {
    console.warn('The spooky sound could not be played:', error.message);
  }
}
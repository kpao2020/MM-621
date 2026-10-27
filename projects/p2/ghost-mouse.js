/*
  Project 2: Spooky Weather
  
  Description:
    - Draws an animated ghost cursor image that follows the mouse pointer.
    - Shows a brief Boo effect and plays a spooky sound when clicking on a card.

  References:
    - P5.js: https://p5js.org/reference/
    - Pixabay sound MP3 files: https://pixabay.com/sound-effects/
    - HTMLAudioElement: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement
    - OpenAI ChatGPT for code assistance and optimization suggestions.

  Code Origin:
    - [AI-ASSISTED FEATURE] For a cursor ghost image and card-click effects;
      its shape follows mouse cursor positioning.
*/

// ============================================================
// GHOST AND CLICK EFFECT STATE
// ============================================================
let ghostX = 0;         // The ghost's current X position on the canvas.
let ghostY = 0;         // The ghost's current Y position on the canvas.
let booUntil = 0;       // "BOO!" effect timer.

// There are 3 emoji options; the click handler is in sketch.js 
// which changes booEmoji to a random spooky emoji
let booEmoji = '🎃';     // initialize to pumpkin emoji
let spookySounds = [];   // sound Array to hold the 2 spooky sound objects.
let nextSpookySound = 0; // index to alternate between the two spooky sounds.
const SPOOKY_SOUND_FILES = [
  '../../assets/sounds/boo-and-laugh.mp3',
  '../../assets/sounds/halloween-horror-laughter.mp3'
];

// ============================================================
// DRAW FLOATING GHOST
// - Draw a tiny animated ghost cursor image that moves toward to the mouse position.
// ============================================================
function drawFloatingGhost() {
  // Adjust these dimensions and offsets to customize the cursor-following ghost.
  const GHOST_WIDTH = 32;
  const GHOST_HEIGHT = 38;
  const EYE_OFFSET_X = 6;
  const EYE_OFFSET_Y = -3;
  const TARGET_X = constrain(mouseX, 18, width - 18);
  const TARGET_Y = constrain(mouseY, 18, height - 18);

  // use lerp to smoothly move the ghost toward the mouse position, at 0.075 speed.
  ghostX = lerp(ghostX || TARGET_X, TARGET_X, 0.075);
  ghostY = lerp(ghostY || TARGET_Y, TARGET_Y, 0.075);

  // use push/pop to isolate the ghost drawing from other canvas elements.
  push();
  noStroke();
  fill(244, 242, 232); // ghost body color - almost white with a hint of gray for a spooky effect.

  // A solid body polygon gives the ghost one clean animated hem.
  const BODY_LEFT = ghostX - GHOST_WIDTH / 2;
  const BODY_RIGHT = ghostX + GHOST_WIDTH / 2;
  const WAVE_SEGMENTS = 12;

  // Draw the round crown first; the moving body redraws its lower edge as a wave.
  ellipse(ghostX, ghostY - 5, GHOST_WIDTH, GHOST_HEIGHT * 0.82);
  
  // beginShape and endShape with (CLOSE) will auto connect each vertex as a closed polygon.
  beginShape();
  vertex(BODY_LEFT, ghostY - 5);

  // use a sine wave to animate the bottom of the ghost image.
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
// SET UP SPOOKY SOUNDS
// - using HTML Audio to Load the two local MP3 files so a card 
//   click can play one immediately.
// ============================================================
function setupSpookySounds() {
  spookySounds = SPOOKY_SOUND_FILES.map((FILE_PATH) => {
    const SOUND = new Audio(FILE_PATH);
    SOUND.preload = 'auto';
    SOUND.load();
    return SOUND;
  });
}

// ============================================================
// PLAY SPOOKY SOUND
// - Alternate between the two local MP3s when a weather card is clicked.
// ============================================================
function playSpookySound() {
  if (spookySounds.length === 0) setupSpookySounds();

  const SOUND = spookySounds[nextSpookySound];
  nextSpookySound = (nextSpookySound + 1) % spookySounds.length;
  SOUND.currentTime = 0;
  SOUND.play().catch((error) => {
    console.warn('The spooky sound could not be played:', error.message);
  });
}

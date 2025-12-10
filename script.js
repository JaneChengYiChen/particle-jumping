// Particle background and gift modal logic split from HTML

// === Particle background (mouse trail) ===
const bgCanvas = document.getElementById("bg-canvas");
const bgCtx = bgCanvas.getContext("2d");

function resize() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

let particles = [];
let mouse = { x: null, y: null };

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  particles.push(new Particle(mouse.x, mouse.y));
});

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 5 + 2;
    this.speedX = Math.random() * 3 - 1.5;
    this.speedY = Math.random() * 3 - 1.5;
    this.hue = Math.random() * 360;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.size *= 0.96; // shrink over time
  }

  draw() {
    bgCtx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
    bgCtx.beginPath();
    bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    bgCtx.fill();
  }
}

function animate() {
  bgCtx.fillStyle = "rgba(0, 0, 0, 0.2)";
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

  particles = particles.filter((p) => p.size > 0.5);

  particles.forEach((p) => {
    p.update();
    p.draw();
  });

  requestAnimationFrame(animate);
}
animate();

// === Gift modal logic ===
const els = {
  gifts: Array.from(document.querySelectorAll(".gift")),
  modal: document.getElementById("quote-modal"),
  quoteText: document.getElementById("quote-text"),
  quoteNext: document.getElementById("quote-next"),
  quoteClose: document.getElementById("quote-close"),
};

const giftLines = [
  "May your days be merry and your heart stay warm.",
  "Small moments of kindness make the grandest memories.",
  "You are the quiet magic in a noisy world.",
  "Let hope be the ribbon that ties your year together.",
  "Lights may fade, but the warmth we share will not.",
  "Carry gentleness—it travels farther than you think.",
  "In every winter, there is a soft promise of spring.",
  "The best gifts are the stories we create together.",
  "May your path be lined with grace and good humor.",
  "You are more treasured than the brightest ornament.",
];
let currentLine = 0;

function showQuote(lineIdx) {
  const idx = lineIdx % giftLines.length;
  currentLine = idx;
  els.quoteText.textContent = giftLines[idx];
  els.modal.hidden = false;
}
function hideQuote() {
  els.modal.hidden = true;
}

els.gifts.forEach((btn) => {
  btn.addEventListener("click", () => {
    const idx = Number(btn.dataset.gift) || 0;
    showQuote(idx);
  });
});
els.quoteNext.addEventListener("click", () => showQuote(currentLine + 1));
els.quoteClose.addEventListener("click", hideQuote);
els.modal.addEventListener("click", (e) => {
  if (e.target === els.modal) hideQuote();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !els.modal.hidden) hideQuote();
});

// === Santa modal from star button ===
const starBtn = document.getElementById("star-btn");
const santaModal = document.getElementById("santa-modal");
const santaClose = document.getElementById("santa-close");
const santaText = document.getElementById("santa-text");

function showSanta() {
  if (santaText) santaText.textContent = "Ho ho ho! Hello there!";
  if (santaModal) santaModal.hidden = false;
}
function hideSanta() {
  if (santaModal) santaModal.hidden = true;
}
starBtn?.addEventListener("click", showSanta);
santaClose?.addEventListener("click", hideSanta);
santaModal?.addEventListener("click", (e) => {
  if (e.target === santaModal) hideSanta();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && santaModal && !santaModal.hidden) hideSanta();
});


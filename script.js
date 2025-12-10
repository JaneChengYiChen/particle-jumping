// Particle background and gift modal logic split from HTML

// === Particle background (mouse trail) ===
const bgCanvas = document.getElementById("bg-canvas");
const bgCtx = bgCanvas.getContext("2d");
const snowCanvas = document.getElementById("snow-canvas");
const snowCtx = snowCanvas.getContext("2d");

function resize() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
  snowCanvas.width = window.innerWidth;
  snowCanvas.height = window.innerHeight;
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

// === Snow background ===
const snowflakes = Array.from({ length: 120 }, () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  r: Math.random() * 2 + 1.2,
  spdY: Math.random() * 0.6 + 0.6,
  drift: Math.random() * 0.6 - 0.3,
}));

function animateSnow() {
  snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
  snowCtx.fillStyle = "rgba(255,255,255,0.85)";

  for (const s of snowflakes) {
    snowCtx.beginPath();
    snowCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    snowCtx.fill();

    s.y += s.spdY;
    s.x += s.drift;
    if (s.y > snowCanvas.height) {
      s.y = -5;
      s.x = Math.random() * snowCanvas.width;
    }
    if (s.x > snowCanvas.width) s.x = 0;
    if (s.x < 0) s.x = snowCanvas.width;
  }
  requestAnimationFrame(animateSnow);
}
animateSnow();

// === Gift modal logic ===
const els = {
  gifts: Array.from(document.querySelectorAll(".gift")),
  modal: document.getElementById("quote-modal"),
  quoteText: document.getElementById("quote-text"),
  quoteNext: document.getElementById("quote-next"),
  quoteClose: document.getElementById("quote-close"),
  jesusImg: document.querySelector(".jesus-img"),
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

function randomLine(exclude) {
  if (giftLines.length <= 1) return 0;
  let idx = exclude;
  while (idx === exclude) {
    idx = Math.floor(Math.random() * giftLines.length);
  }
  return idx;
}

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
    const idx = randomLine(currentLine);
    showQuote(idx);
  });
});
els.quoteNext.addEventListener("click", () => showQuote(randomLine(currentLine)));
els.quoteClose.addEventListener("click", hideQuote);
els.modal.addEventListener("click", (e) => {
  if (e.target === els.modal) hideQuote();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !els.modal.hidden) hideQuote();
});

// === Santa modal (unused by default) ===
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

// === Use original jesus.png image without any processing ===

// Toast helper
const toastContainer = document.getElementById("toast-container");
function showToast(text) {
  if (!toastContainer) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = text;
  toastContainer.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 3000);
}

// === Anonymous messaging (local only) ===
const peopleIds = Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i)); // A-J
const peopleListEl = document.getElementById("people-list");
const toSelect = document.getElementById("to");
const msgInput = document.getElementById("msg");
const form = document.getElementById("message-form");
const clearAllBtn = document.getElementById("clear-all");

// Local in-memory store: { A: [ {text, ts} ], ... }
const inbox = {};
peopleIds.forEach((id) => (inbox[id] = []));
let currentPerson = peopleIds[0];

function renderPeople() {
  if (!peopleListEl) return;
  peopleListEl.innerHTML = "";
  peopleIds.forEach((id) => {
    const btn = document.createElement("button");
    btn.textContent = `Person ${id}`;
    btn.dataset.id = id;
    if (id === currentPerson) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentPerson = id;
      renderPeople();
      updateToSelect(id);
      showToast(`Now viewing inbox of ${id}. Click the star to view inbox.`);
    });
    peopleListEl.appendChild(btn);
  });
}

function updateToSelect(selected) {
  if (!toSelect) return;
  toSelect.innerHTML = "";
  peopleIds.forEach((id) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = `Person ${id}`;
    if (selected === id) opt.selected = true;
    toSelect.appendChild(opt);
  });
}

function addMessage(to, text) {
  if (!inbox[to]) inbox[to] = [];
  inbox[to].push({ text, ts: Date.now() });
}

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const to = toSelect?.value || currentPerson;
  const text = msgInput?.value.trim();
  if (!text) return;
  addMessage(to, text);
  if (msgInput) msgInput.value = "";
  showToast(`Sent anonymously to ${to}.`);
});

clearAllBtn?.addEventListener("click", () => {
  peopleIds.forEach((id) => (inbox[id] = []));
  showToast("All local messages cleared.");
});

// Modal to view inbox via star
const inboxModal = document.createElement("div");
inboxModal.className = "quote-modal";
inboxModal.id = "inbox-modal";
inboxModal.hidden = true;
inboxModal.innerHTML = `
  <div class="quote-box">
    <div class="inbox-header">
      <select id="inbox-select"></select>
      <button id="inbox-close" class="secondary">Close</button>
    </div>
    <div id="inbox-list" class="inbox-list"></div>
  </div>
`;
document.body.appendChild(inboxModal);

const inboxSelect = inboxModal.querySelector("#inbox-select");
const inboxList = inboxModal.querySelector("#inbox-list");
const inboxClose = inboxModal.querySelector("#inbox-close");

function renderInboxSelect() {
  if (!inboxSelect) return;
  inboxSelect.innerHTML = "";
  peopleIds.forEach((id) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = `Person ${id}`;
    if (id === currentPerson) opt.selected = true;
    inboxSelect.appendChild(opt);
  });
}

function renderInboxList(id) {
  if (!inboxList) return;
  const items = inbox[id] || [];
  if (!items.length) {
    inboxList.innerHTML = `<p class="empty">No messages for ${id} yet.</p>`;
    return;
  }
  inboxList.innerHTML = items
    .slice()
    .reverse()
    .map(
      (m) =>
        `<div class="inbox-item"><div class="meta">${new Date(m.ts).toLocaleTimeString()}</div><div class="text">${m.text}</div></div>`
    )
    .join("");
}

function openInbox() {
  renderInboxSelect();
  renderInboxList(inboxSelect.value);
  inboxModal.hidden = false;
}
function closeInbox() {
  inboxModal.hidden = true;
}

inboxSelect?.addEventListener("change", () => {
  renderInboxList(inboxSelect.value);
});
inboxClose?.addEventListener("click", closeInbox);
inboxModal?.addEventListener("click", (e) => {
  if (e.target === inboxModal) closeInbox();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !inboxModal.hidden) closeInbox();
});

// Initial render
renderPeople();
updateToSelect(currentPerson);

// Star now opens inbox to see who has messages
starBtn?.addEventListener("click", openInbox);
santaClose?.addEventListener("click", hideSanta);
santaModal?.addEventListener("click", (e) => {
  if (e.target === santaModal) hideSanta();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && santaModal && !santaModal.hidden) hideSanta();
  if (e.key === "Escape" && !inboxModal.hidden) closeInbox();
});

/* ── Clock ──────────────────────────────────────────────────── */
const clockEl = document.getElementById("clock");
function tick() {
  clockEl.textContent = new Date().toTimeString().slice(0, 8);
}
tick();
setInterval(tick, 1000);

/* ── Status helper ──────────────────────────────────────────── */
function setStatus(msg, state) {
  const t   = document.getElementById("status");
  const dot = document.getElementById("dot");
  t.textContent = msg;
  t.className   = "t-text " + (state || "");
  dot.className = "status-dot " + (state === "busy" ? "busy" : state === "err" ? "error" : "");
}

/* ── Ripple helper ──────────────────────────────────────────── */
const execBtn = document.getElementById("execBtn");

execBtn.addEventListener("click", function (e) {
  if (execBtn.disabled) return; // 🛡️ prevent ripple when disabled

  const rip  = document.getElementById("ripple");
  const rect = this.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  rip.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
  rip.classList.remove("go");
  void rip.offsetWidth;
  rip.classList.add("go");
});

/* ── Dropdown ───────────────────────────────────────────────── */
let selectedCmd = "";

/* 🔧 Helper to control button */
function setExecDisabled(state) {
  execBtn.disabled = state;
}

function toggleDropdown() {
  const menu = document.getElementById("ddMenu");
  const isOpen = menu.classList.contains("open");
  isOpen ? closeDropdown() : openDropdown();
}

function openDropdown() {
  document.getElementById("ddMenu").classList.add("open");
  document.getElementById("ddTrigger").classList.add("open");
  setExecDisabled(true);   // 🔒 disable button
}

function closeDropdown() {
  document.getElementById("ddMenu").classList.remove("open");
  document.getElementById("ddTrigger").classList.remove("open");
  setExecDisabled(false);  // 🔓 enable button
}

function selectCmd(el) {
  selectedCmd = el.dataset.value;
  document.getElementById("ddValue").textContent = el.textContent.trim();
  document.getElementById("ddTrigger").classList.add("selected");

  document.querySelectorAll(".dd-item").forEach(i => i.classList.remove("active"));
  el.classList.add("active");

  closeDropdown(); // auto re-enables button
}

// Close dropdown on outside click
document.addEventListener("click", function (e) {
  const dropdown = document.getElementById("dropdown");
  if (dropdown && !dropdown.contains(e.target)) {
    closeDropdown();
  }
});

/* ── Execute ────────────────────────────────────────────────── */
function execute() {
  if (execBtn.disabled) return; // 🛡️ hard safety

  const key = document.getElementById("key").value.trim();

  if (!key) {
    setStatus("ACCESS KEY REQUIRED", "err");
    shake(document.getElementById("key"));
    return;
  }

  if (!selectedCmd) {
    setStatus("SELECT A COMMAND FIRST", "err");
    shake(document.getElementById("ddTrigger"));
    return;
  }

  setStatus(`EXECUTING: ${selectedCmd.toUpperCase()} ...`, "busy");

  setTimeout(() => {
    const url = `https://api.muffinjuice.xyz/control?cmd=${selectedCmd}&key=${key}`;
    window.open(url, "_blank");
  }, 320);
}

/* ── Shake ──────────────────────────────────────────────────── */
function shake(el) {
  el.style.animation = "none";
  void el.offsetWidth;
  el.style.animation = "shake 0.38s cubic-bezier(0.36, 0.07, 0.19, 0.97)";
  el.addEventListener("animationend", () => el.style.animation = "", { once: true });
}
/* ── URL Param Handler ──────────────────────────────────────── */
function handleIncomingLocation() {
  const params = new URLSearchParams(window.location.search);
  const link = params.get("link");

  if (!link) return;

  setTimeout(() => {
    displayLocation(link);
    window.history.replaceState({}, "", window.location.pathname);
  }, 600);
}

function displayLocation(link) {
  setStatus("LOCATION RECEIVED", "ok");
  const body = document.getElementById("terminalBody");
  const line = document.createElement("div");
  line.className = "t-line";

  line.innerHTML = `
    <span class="t-prompt">›</span>
    <span class="t-text ok">
      MAP DATA ACQUIRED<br>
      <a href="${link}" target="_blank" class="map-link">[ OPEN SATELLITE VIEW ]</a>
    </span>`;

  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
}

handleIncomingLocation();

/* ── Clock ──────────────────────────────────────────────────── */
const clockEl = document.getElementById("clock");
function tick() {
  clockEl.textContent = new Date().toTimeString().slice(0, 8);
}
tick();
setInterval(tick, 1000);

/* ── Real-Time Listener (Dweet.io) ─────────────────────────── */
let lastDweetTime = null;
let pollInterval = null;

function startListening(key) {
  if (pollInterval) clearInterval(pollInterval);
  
  // Simple ID for easy MacroDroid setup
  const mailboxId = "muffin-" + key.trim();
  setStatus(`LISTENING FOR RESPONSE...`, "ok");

  pollInterval = setInterval(async () => {
    try {
      const resp = await fetch(`https://dweet.io/get/latest/dweet/for/${mailboxId}`);
      const data = await resp.json();
      
      if (data.this === "succeeded" && data.with.length > 0) {
        const dweet = data.with[0];
        const link = dweet.content.link;
        const time = dweet.created;

        if (link && time !== lastDweetTime) {
          lastDweetTime = time;
          displayLocation(link);
        }
      }
    } catch (e) {
      console.error("Polling error:", e);
    }
  }, 3000);
}

/* ── Status helper ──────────────────────────────────────────── */
function setStatus(msg, state) {
  const body = document.getElementById("terminalBody");
  const dot = document.getElementById("dot");

  // Create new line element
  const line = document.createElement("div");
  line.className = "t-line";

  const span = document.createElement("span");
  span.className = "t-text " + (state || "");
  span.textContent = msg;

  line.innerHTML = `<span class="t-prompt">›</span>`;
  line.appendChild(span);

  body.appendChild(line);

  // Auto-scroll to bottom
  body.scrollTop = body.scrollHeight;

  // Update status dot
  dot.className = "status-dot " + (state === "busy" ? "busy" : state === "err" ? "error" : "");
}

/* ── Ripple helper ──────────────────────────────────────────── */
const execBtn = document.getElementById("execBtn");

execBtn.addEventListener("click", function (e) {
  if (execBtn.disabled) return; // 🛡️ prevent ripple when disabled

  const rip = document.getElementById("ripple");
  const rect = this.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  rip.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
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
  const container = document.querySelector(".container");
  container.classList.add("dropdown-open");
  document.getElementById("dropdown").classList.add("open");
  document.getElementById("ddMenu").classList.add("open");
  document.getElementById("ddTrigger").classList.add("open");
  setExecDisabled(true);   // 🔒 disable button
}

function closeDropdown() {
  const container = document.querySelector(".container");
  container.classList.remove("dropdown-open");
  document.getElementById("dropdown").classList.remove("open");
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

  // Start listening for the response now that we have a key
  startListening(key);

  setTimeout(() => {
    const url = `https://api.muffinjuice.xyz/control?cmd=${selectedCmd}&key=${key}`;
    window.open(url, "_blank");

    // Success log
    setStatus(`EXECUTED: ${selectedCmd.toUpperCase()}`, "ok");
  }, 320);
}

/* ── Shake ──────────────────────────────────────────────────── */
function shake(el) {
  el.style.animation = "none";
  void el.offsetWidth;
  el.style.animation = "shake 0.38s cubic-bezier(0.36, 0.07, 0.19, 0.97)";
  el.addEventListener("animationend", () => el.style.animation = "", { once: true });
}
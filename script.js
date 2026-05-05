/* ── Live Polling ───────────────────────────────────────────── */
let lastLocationTimestamp = 0;

async function pollLocation() {
  try {
    const res = await fetch("/get-location");
    if (!res.ok) return;
    
    const data = await res.json();
    if (data.timestamp > lastLocationTimestamp) {
      lastLocationTimestamp = data.timestamp;
      displayLocation(data.lat, data.lon, data.link);
    }
  } catch (e) {
    // Ignore errors during background polling
  }
}

function displayLocation(lat, lon, link) {
  setStatus("LOCATION RECEIVED", "ok");
  const body = document.getElementById("terminalBody");
  const line = document.createElement("div");
  line.className = "t-line";
  
  let content = "";
  if (lat && lon) {
    content += `LAT: ${lat}<br>LON: ${lon}<br>`;
  }
  content += `<a href="${link}" target="_blank" style="color:var(--amber);text-decoration:underline;">[ VIEW ON MAP ]</a>`;

  line.innerHTML = `
    <span class="t-prompt">›</span>
    <span class="t-text ok">${content}</span>
  `;
  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
}

// Start polling every 5 seconds
setInterval(pollLocation, 5000);

/* ── URL Param Handler ──────────────────────────────────────── */
function handleIncomingLocation() {
  const params = new URLSearchParams(window.location.search);
  const lat = params.get("lat");
  const lon = params.get("lon");
  const link = params.get("link");
  const urlKey = params.get("key");

  if (lat && lon) {
    // If a key was provided in URL, pre-fill it
    if (urlKey) {
      document.getElementById("key").value = urlKey;
    }
    
    setTimeout(() => {
      setStatus("LOCATION RECEIVED", "ok");
      const body = document.getElementById("terminalBody");
      const line = document.createElement("div");
      line.className = "t-line";
      line.innerHTML = `
        <span class="t-prompt">›</span>
        <span class="t-text ok">
          LAT: ${lat}<br>
          LON: ${lon}<br>
          <a href="${link}" target="_blank" style="color:var(--amber);text-decoration:underline;">[ VIEW ON MAP ]</a>
        </span>
      `;
      body.appendChild(line);
      body.scrollTop = body.scrollHeight;
    }, 1000);
  }
}
handleIncomingLocation();

/* ── Clock ──────────────────────────────────────────────────── */
const clockEl = document.getElementById("clock");
function tick() {
  clockEl.textContent = new Date().toTimeString().slice(0, 8);
}
tick();
setInterval(tick, 1000);

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
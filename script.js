/* ── Real-time Polling (Case B) ────────────────────────────── */
let lastReceivedLink = "";
let lastReportTime = 0;
let isWaitingForFreshData = false;
let referenceTime = 0;
let lastLocationTime = Date.now();

function updateSignalBars(dbm) {
  const bars = document.querySelectorAll("#sigVal .bar");
  const val = parseInt(dbm);
  let count = 0;

  if (isNaN(val)) count = 0;
  else if (val >= -75) count = 4;
  else if (val >= -85) count = 3;
  else if (val >= -95) count = 2;
  else if (val >= -105) count = 1;
  else count = 0;

  bars.forEach((b, i) => {
    b.classList.toggle("fill", i < count);
  });
}

async function startPolling() {
  setInterval(async () => {
    try {
      const res = await fetch("/poll");
      if (!res.ok) return;
      const data = await res.json();
      
      // Update Hardware readout
      if (data.status) {
        const s = data.status;
        if (s.battery_level) document.getElementById("battVal").textContent = s.battery_level + "%";
        
        // Handle Charging state
        const battCont = document.getElementById("battContainer");
        if (s.battery_status && s.battery_status.toLowerCase() === "on") {
          battCont.classList.add("charging");
        } else {
          battCont.classList.remove("charging");
        }

        if (s.signal_strength) updateSignalBars(s.signal_strength);
        if (s.battery_temperature) document.getElementById("tempVal").textContent = s.battery_temperature + "°C";
        if (s.phone_uptime) document.getElementById("uptimeVal").textContent = s.phone_uptime;
      }

      // Check for fresh location link
      if (data.location && data.location.link) {
        if (data.location.updated > lastLocationTime) {
          lastLocationTime = data.location.updated;
          displayLocation(data.location.link);
        }
      }
    } catch (e) {
      console.error("Poll error:", e);
    }
  }, 3500);
}

function handleIncomingLocation() {
  const params = new URLSearchParams(window.location.search);
  const link = params.get("link");

  if (!link) return;

  setTimeout(() => {
    lastReceivedLink = link; // Sync polling state
    displayLocation(link);
    window.history.replaceState({}, "", window.location.pathname);
  }, 600);
}

/* ── Terminal Management ───────────────────────────────────── */
function saveLog(entry) {
  let history = JSON.parse(localStorage.getItem("remote_terminal_history") || "[]");
  history.push(entry);
  if (history.length > 50) history.shift();
  localStorage.setItem("remote_terminal_history", JSON.stringify(history));
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem("remote_terminal_history") || "[]");
  history.forEach(item => {
    if (item.type === "location") renderLocation(item.link);
    else renderStatus(item.msg, item.state);
  });
}

function renderStatus(msg, state) {
  const body = document.getElementById("terminalBody");
  const line = document.createElement("div");
  line.className = "t-line";
  line.innerHTML = `<span class="t-prompt">›</span><span class="t-text ${state || ""}">${msg}</span>`;
  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
  
  const dot = document.getElementById("dot");
  if (dot) dot.className = "status-dot " + (state === "busy" ? "busy" : state === "err" ? "error" : "");
}

function renderLocation(link) {
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

function setStatus(msg, state) {
  renderStatus(msg, state);
  saveLog({ type: "status", msg, state });
}

function displayLocation(link) {
  renderLocation(link);
  saveLog({ type: "location", link });
}

function checkInitialLogin() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("login") === "success") {
    setStatus("AUTHENTICATION SUCCESS", "ok");
    window.history.replaceState({}, "", "/home");
  } else {
    // If not a fresh login, just load what we had
    loadHistory();
  }

  // Always show current status if empty
  const body = document.getElementById("terminalBody");
  if (body.children.length === 0) {
    setStatus("IDLE — AWAITING INPUT");
  }
}

handleIncomingLocation();
startPolling();
checkInitialLogin();

/* ── Clock ──────────────────────────────────────────────────── */
const clockEl = document.getElementById("clock");
function tick() {
  clockEl.textContent = new Date().toTimeString().slice(0, 8);
}
tick();
setInterval(tick, 1000);

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

let focusedIndex = -1;

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
  
  // Reset search
  const search = document.getElementById("ddSearch");
  search.value = "";
  filterCommands("");
  // Removed auto-focus to prevent keyboard popup on mobile

  // Reset focus
  focusedIndex = -1;
  updateFocus();
}

function filterCommands(query) {
  const q = query.toLowerCase();
  const items = document.querySelectorAll(".dd-item");
  const labels = document.querySelectorAll(".dd-group-label");
  
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(q) ? "block" : "none";
  });

  // Hide labels if no visible items below them
  labels.forEach(label => {
    let next = label.nextElementSibling;
    let hasVisible = false;
    while (next && next.classList.contains("dd-item")) {
      if (next.style.display !== "none") {
        hasVisible = true;
        break;
      }
      next = next.nextElementSibling;
    }
    label.style.display = hasVisible ? "block" : "none";
  });
}

document.getElementById("ddSearch").addEventListener("input", (e) => {
  filterCommands(e.target.value);
  focusedIndex = -1;
  updateFocus();
});

function closeDropdown() {
  const container = document.querySelector(".container");
  container.classList.remove("dropdown-open");
  document.getElementById("dropdown").classList.remove("open");
  document.getElementById("ddMenu").classList.remove("open");
  document.getElementById("ddTrigger").classList.remove("open");
  setExecDisabled(false);  // 🔓 enable button
}

function updateFocus() {
  const allItems = document.querySelectorAll(".dd-item");
  const visibleItems = Array.from(allItems).filter(i => i.style.display !== "none");
  
  allItems.forEach(i => i.classList.remove("focused"));

  if (focusedIndex >= 0 && visibleItems[focusedIndex]) {
    visibleItems[focusedIndex].classList.add("focused");
    visibleItems[focusedIndex].scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  
  // Disable mouse hover effects while navigating with keyboard
  allItems.forEach(i => i.classList.add("no-hover"));
}

function selectCmd(el) {
  selectedCmd = el.dataset.value;
  document.getElementById("ddValue").textContent = el.textContent.trim();
  document.getElementById("ddTrigger").classList.add("selected");

  document.querySelectorAll(".dd-item").forEach(i => i.classList.remove("active"));
  el.classList.add("active");

  // Handle secondary input (cmd2)
  const cmd2Wrapper = document.getElementById("cmd2Wrapper");
  const cmd2Input = document.getElementById("cmd2");
  if (selectedCmd === "speak_text") {
    cmd2Wrapper.classList.add("visible");
    document.getElementById("cmd2Label").textContent = "MESSAGE TO SPEAK";
    cmd2Input.placeholder = "ENTER TEXT...";
  } else {
    cmd2Wrapper.classList.remove("visible");
  }

  closeDropdown(); // auto re-enables button
}

// Global Keyboard Handler
document.addEventListener("keydown", function (e) {
  const menu = document.getElementById("ddMenu");
  const isOpen = menu.classList.contains("open");
  if (!isOpen) return;

  const items = Array.from(document.querySelectorAll(".dd-item")).filter(i => i.style.display !== "none");

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (items.length > 0) {
      focusedIndex = (focusedIndex + 1) % items.length;
      updateFocus();
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (items.length > 0) {
      focusedIndex = (focusedIndex - 1 + items.length) % items.length;
      updateFocus();
    }
  } else if (e.key === "Enter") {
    if (isOpen) {
      if (focusedIndex >= 0 && items[focusedIndex]) {
        e.preventDefault();
        selectCmd(items[focusedIndex]);
      }
    } else {
      // Global Enter: Execute if everything is ready
      const key = document.getElementById("key").value.trim();
      if (key && selectedCmd) {
        e.preventDefault();
        execute();
      }
    }
  } else if (e.key === "Escape") {
    closeDropdown();
  }
});

// Close dropdown on outside click
document.addEventListener("click", function (e) {
  const dropdown = document.getElementById("dropdown");
  if (dropdown && !dropdown.contains(e.target)) {
    closeDropdown();
  }
});

/* ── Execute ────────────────────────────────────────────────── */
function haptic() {
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(15);
  }
}

function execute() {
  if (execBtn.disabled) return; // 🛡️ hard safety
  haptic();

  const key = document.getElementById("key").value.trim();
  const cmd2 = document.getElementById("cmd2").value.trim();

  if (!key) {
    setStatus("MACROS KEY REQUIRED", "err");
    shake(document.getElementById("key"));
    return;
  }

  if (!selectedCmd) {
    setStatus("SELECT A COMMAND FIRST", "err");
    shake(document.getElementById("ddTrigger"));
    return;
  }

  // Visual feedback: Spinner
  execBtn.classList.add("loading");
  setTimeout(() => execBtn.classList.remove("loading"), 1000);

  // If cmd2 is required but empty
  if (selectedCmd === "speak_text" && !cmd2) {
    setStatus("MESSAGE TEXT REQUIRED", "err");
    shake(document.getElementById("cmd2"));
    return;
  }

  // If it's a location command, start waiting for a FRESH report
  if (selectedCmd === "location_share_recent" || selectedCmd === "location_share") {
    isWaitingForFreshData = true;
    referenceTime = lastReportTime; // Use the current server time as the baseline
    setStatus("REQUEST SENT — AWAITING DEVICE...", "busy");

    // 🛡️ FAILSAFE: If no response in 30 seconds (GPS fix can be slow), show what we have
    setTimeout(() => {
      if (isWaitingForFreshData) {
        isWaitingForFreshData = false; // stop waiting
        setStatus("LOCATION FETCH FAILED FROM MACROS", "err");
        setStatus("TRY RECENT LOCATION OPTION", "busy");
        
        if (lastReceivedLink) {
          setStatus("PRINTING AVAILABLE DATA FROM KV", "busy");
          setTimeout(() => displayLocation(lastReceivedLink), 500);
        } else {
          setStatus("NO DATA AVAILABLE IN DATABASE", "err");
        }
      }
    }, 30000);
  } else {
    setStatus(`EXECUTING: ${selectedCmd.toUpperCase()} ...`, "busy");
  }

  setTimeout(() => {
    let url = `/control?cmd=${selectedCmd}&key=${key}`;
    if (cmd2) url += `&cmd2=${encodeURIComponent(cmd2)}`;

    // SILENT EXECUTION: Send the command in the background
    fetch(url).catch(() => {}); 

    // Success log
    if (selectedCmd !== "location_share_recent" && selectedCmd !== "location_share") {
      setStatus(`EXECUTED: ${selectedCmd.toUpperCase()}`, "ok");
    }
  }, 320);
}

/* ── Shake ──────────────────────────────────────────────────── */
function shake(el) {
  el.style.animation = "none";
  void el.offsetWidth;
  el.style.animation = "shake 0.38s cubic-bezier(0.36, 0.07, 0.19, 0.97)";
  el.addEventListener("animationend", () => el.style.animation = "", { once: true });
}

// Re-enable hover when mouse moves
document.addEventListener("mousemove", function() {
  document.querySelectorAll(".dd-item").forEach(i => i.classList.remove("no-hover"));
});

// Auto-resize textarea for MESSAGE TO SPEAK
document.getElementById("cmd2").addEventListener("input", function() {
  this.style.height = "auto";
  this.style.height = (this.scrollHeight) + "px";
});
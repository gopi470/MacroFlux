/* ── Real-time Polling (Case B) ────────────────────────────── */
let lastReceivedLink = "";
let lastReportTime = 0;
let isWaitingForFreshData = false;
let referenceTime = 0;
let lastLocationTime = parseInt(localStorage.getItem("remote_last_loc_time") || "0");
let lastUpdateTimestamp = parseInt(localStorage.getItem("remote_last_seen") || "0");

function updateFreshness() {
  const el = document.getElementById("lastSeen");
  const dot = document.getElementById("dot");
  if (!el) return;

  if (lastUpdateTimestamp === 0) {
    el.textContent = "UPDATED: NEVER";
    el.style.color = "var(--red)";
    el.style.opacity = "0.7";
    return;
  }

  const diffSec = Math.floor((Date.now() - lastUpdateTimestamp) / 1000);
  const diffMin = Math.floor(diffSec / 60);

  if (diffSec < 60) {
    el.textContent = "UPDATED: JUST NOW";
    el.style.color = "var(--teal)";
    el.style.opacity = "0.7"; // Increased from 0.4 for visibility
    if (dot && !isTerminalTyping) dot.className = "status-dot";
  } else {
    el.textContent = `UPDATED: ${diffMin}m AGO`;
    
    if (diffMin >= 120) {
      el.style.color = "var(--red)";
      el.style.opacity = "1";
      if (dot) dot.className = "status-dot error";
    } else if (diffSec > 30) {
      el.style.color = "var(--amber)";
      el.style.opacity = "1";
      if (dot) dot.className = "status-dot busy";
    }
  }
}
setInterval(updateFreshness, 5000); // Check every 5s instead of 10s

function bumpLastSeen() {
  lastUpdateTimestamp = Date.now();
  localStorage.setItem("remote_last_seen", lastUpdateTimestamp);
  updateFreshness();
}

function updateSignalBars(rawVal) {
  const bars = document.querySelectorAll("#sigVal .bar");
  const val = parseInt(rawVal);
  let count = 0;

  if (isNaN(val)) {
    count = 0;
  } else if (val > 0) {
    // If phone sends ASU (0-31) or a 0-4 scale
    if (val >= 25 || val === 4) count = 4;
    else if (val >= 18 || val === 3) count = 3;
    else if (val >= 12 || val === 2) count = 2;
    else if (val >= 1 || val === 1) count = 1;
  } else {
    // Standard dBm (Negative) - Adjusted for better sensitivity
    if (val >= -82) count = 4;      // Excellent
    else if (val >= -92) count = 3; // Good
    else if (val >= -102) count = 2; // Fair
    else if (val >= -112) count = 1; // Poor
    else count = 0;
  }

  bars.forEach((b, i) => {
    b.classList.toggle("fill", i < count);
  });
}

async function startPolling() {
  setInterval(async function pollStatus() {
    const start = Date.now();
    try {
      const response = await fetch("/poll");
      const end = Date.now();
      const ping = end - start;
      const pingEl = document.getElementById("pingVal");
      if (pingEl) pingEl.textContent = `${ping}ms`;

      // SESSION EXPIRED CHECK
      if (response.status === 401 || response.status === 403 || (response.redirected && response.url.includes("/login"))) {
        logout();
        return;
      }

      if (response.ok) {
        bumpLastSeen();
      }

      const data = await response.json();
      
      // Update Hardware readout
      if (data.status) {
        lastUpdateTimestamp = Date.now();
        localStorage.setItem("remote_last_seen", lastUpdateTimestamp);
        const s = data.status;
        if (s.battery_level) {
          const level = parseInt(s.battery_level);
          const battValEl = document.getElementById("battVal");
          battValEl.textContent = level + "%";
          
          // Handle Critical Level
          if (level < 15 && level > 0) {
            battValEl.classList.add("critical");
            if (!window.hasShownLowPowerWarning) {
              setStatus("CRITICAL: LOW POWER DETECTED", "err");
              window.hasShownLowPowerWarning = true;
            }
          } else {
            battValEl.classList.remove("critical");
            window.hasShownLowPowerWarning = false;
          }
        }
        
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
        const reportTime = data.location.updated;
        // ONLY print to terminal if user is ACTIVELY waiting for a fetch
        if (isWaitingForFreshData && reportTime > referenceTime) {
          isWaitingForFreshData = false; 
          lastLocationTime = reportTime;
          lastReceivedLink = data.location.link; // Sync cache
          localStorage.setItem("remote_last_loc_time", lastLocationTime);
          displayLocation(data.location.link);
        } else {
          // Just sync the internal timestamp and cache quietly
          lastLocationTime = Math.max(lastLocationTime, reportTime);
          lastReceivedLink = data.location.link; // Keep cache fresh for failsafe
          localStorage.setItem("remote_last_loc_time", lastLocationTime);
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

function getTimestamp() {
  const now = new Date();
  let hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return `[${hours}:${minutes}:${seconds} ${ampm}]`;
}

let terminalQueue = [];
let isTerminalTyping = false;
let errorDetails = {}; // Store raw error text
let lastSuccessMap = JSON.parse(localStorage.getItem("remote_last_success") || "{}");

function updateLastSuccess(cmd, time) {
  lastSuccessMap[cmd] = time;
  localStorage.setItem("remote_last_success", JSON.stringify(lastSuccessMap));
}

function getErrorAnalysis(details) {
  const low = details.toLowerCase();
  if (low.includes("cannot get") || low.includes("404")) return "ENDPOINT NOT FOUND: The system tried to reach a service that doesn't exist. Check your MacroDroid URL.";
  if (low.includes("invalid key") || low.includes("unauthorized")) return "SECURITY ALERT: Access Key rejected. The command was blocked by the system security layer.";
  if (low.includes("timeout")) return "CONNECTION TIMEOUT: The target device failed to respond in time. It might be offline or in a low-signal area.";
  if (low.includes("failed to fetch") || low.includes("network error")) return "NETWORK FAILURE: Could not establish a connection to the gateway. Check your internet connection.";
  if (low.includes("500") || low.includes("internal server error")) return "SYSTEM CRASH: The server encountered a fatal error while processing your request.";
  return "UNKNOWN ERROR: An unexpected response was received from the gateway.";
}

function showErrDetails(id) {
  const entry = errorDetails[id];
  const modal = document.getElementById("errorModal");
  const body = document.getElementById("errorModalBody");
  
  if (modal && body) {
    const details = entry.details;
    const displayDetails = (details && details.trim() !== "") ? details.trim() : "[ NO DATA RETURNED FROM SERVER ]";
    const analysis = getErrorAnalysis(displayDetails);
    const cmdKey = entry.cmdKey || "UNKNOWN";
    const lastSuccess = lastSuccessMap[cmdKey] || "NEVER LOGGED";
    
    body.innerHTML = `
      <div style="color:var(--text); margin-bottom: 20px; font-weight: 700; line-height: 1.4; font-size: 13px;">${analysis}</div>
      
      <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); padding: 10px; border-radius: 4px; margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; font-size: 9px; opacity: 0.6; margin-bottom: 4px;">
          <span>EVENT TIME:</span>
          <span>${entry.time}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 9px; opacity: 0.6; margin-bottom: 4px;">
          <span>CMD TARGET:</span>
          <span style="color:var(--amber)">${entry.msg.split(" ")[0]}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 9px; opacity: 0.6; margin-bottom: 4px;">
          <span>LAST SUCCESS:</span>
          <span style="color:var(--teal)">${lastSuccess}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 9px; opacity: 0.6; margin-bottom: 4px;">
          <span>SIGNAL LEVEL:</span>
          <span>${entry.sig || "UNKNOWN"}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 9px; opacity: 0.6;">
          <span>BATTERY LEVEL:</span>
          <span>${entry.bat || "UNKNOWN"}</span>
        </div>
      </div>
    `;
    modal.classList.add("open");
  }
}

function closeModal() {
  const modal = document.getElementById("errorModal");
  if (modal) modal.classList.remove("open");
}

// Keyboard Support
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

function clearLogs() {
  const body = document.getElementById("terminalBody");
  if (body) {
    body.innerHTML = "";
    terminalHistory = [];
    localStorage.removeItem("remote_terminal_history");
    setStatus("TERMINAL LOGS CLEARED", "busy");
  }
}

async function processTerminalQueue() {
  if (isTerminalTyping || terminalQueue.length === 0) return;
  
  isTerminalTyping = true;
  const item = terminalQueue.shift();
  
  if (item.type === "location") {
    await renderLocation(item.link, item.time, false);
  } else {
    await renderStatus(item.msg, item.state, item.time, false, item.details, item.cmdKey, item.sig, item.bat);
  }
  
  isTerminalTyping = false;
  processTerminalQueue();
}

function renderStatus(msg, state, time, skipTyping = false, details = null, cmdKey = null, sig = null, bat = null) {
  return new Promise((resolve) => {
    const body = document.getElementById("terminalBody");
    const line = document.createElement("div");
    const timestamp = time || getTimestamp();
    line.className = "t-line";
    line.innerHTML = `
      <div class="t-content">
        <span class="t-prompt">›</span>
        <span class="t-text ${state || ""}"></span>
      </div>
      <span class="t-time">${timestamp}</span>`;
    body.appendChild(line);

    const textEl = line.querySelector(".t-text");
    
    if (skipTyping) {
      textEl.textContent = msg;
      if (details) {
        const errId = "err_" + Math.random().toString(36).substr(2, 9);
        errorDetails[errId] = { details, time, msg, cmdKey, sig, bat };
        textEl.innerHTML += ` <span class="err-details-btn" onclick="showErrDetails('${errId}')">[See Details]</span>`;
      }
      body.scrollTop = body.scrollHeight;
      resolve();
    } else {
      let i = 0;
      // DYNAMIC SPEED: Fast on mobile (5ms) or if queue is large
      const speed = (window.innerWidth <= 768 || terminalQueue.length > 2) ? 5 : 25;
      const timer = setInterval(() => {
        textEl.textContent += msg[i];
        i++;
        body.scrollTop = body.scrollHeight;
        if (i >= msg.length) {
          clearInterval(timer);
          if (details) {
            const errId = "err_" + Math.random().toString(36).substr(2, 9);
            errorDetails[errId] = { details, time, msg, cmdKey, sig, bat };
            textEl.innerHTML += ` <span class="err-details-btn" onclick="showErrDetails('${errId}')">[See Details]</span>`;
          }
          body.scrollTop = body.scrollHeight;
          resolve();
        }
      }, speed);
    }
    
    const dot = document.getElementById("dot");
    if (dot) dot.className = "status-dot " + (state === "busy" ? "busy" : state === "err" ? "error" : "");
  });
}

function renderLocation(link, time, skipTyping = false) {
  return new Promise((resolve) => {
    const body = document.getElementById("terminalBody");
    const line = document.createElement("div");
    const timestamp = time || getTimestamp();
    line.className = "t-line";
    line.innerHTML = `
      <div class="t-content">
        <span class="t-prompt">›</span>
        <span class="t-text ok"></span>
      </div>
      <span class="t-time">${timestamp}</span>`;
    body.appendChild(line);

    const textEl = line.querySelector(".t-text");
    const msg = "MAP DATA ACQUIRED";

    if (skipTyping) {
      textEl.innerHTML = `${msg}<br><a href="${link}" target="_blank" class="map-link">[ OPEN SATELLITE VIEW ]</a>`;
      body.scrollTop = body.scrollHeight;
      resolve();
    } else {
      let i = 0;
      // Speed sync with mobile/queue optimization
      const speed = (window.innerWidth <= 768 || terminalQueue.length > 2) ? 5 : 35;
      const timer = setInterval(() => {
        textEl.textContent += msg[i];
        i++;
        body.scrollTop = body.scrollHeight;
        if (i >= msg.length) {
          clearInterval(timer);
          textEl.innerHTML += `<br><a href="${link}" target="_blank" class="map-link">[ OPEN GOOGLE MAPS ]</a>`;
          body.scrollTop = body.scrollHeight;
          resolve();
        }
      }, speed);
    }
  });
}

function setStatus(msg, state, details = null, cmdKey = null) {
  const time = getTimestamp();
  const sig = document.getElementById("sigVal")?.textContent?.trim() || "N/A";
  const bat = document.getElementById("batVal")?.textContent?.trim() || "N/A";
  
  terminalQueue.push({ type: "status", msg, state, time, details, cmdKey, sig, bat });
  saveLog({ type: "status", msg, state, time, details, cmdKey, sig, bat });
  processTerminalQueue();
}

function displayLocation(link) {
  const time = getTimestamp();
  terminalQueue.push({ type: "location", link, time });
  saveLog({ type: "location", link, time });
  processTerminalQueue();
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem("remote_terminal_history") || "[]");
  history.forEach(item => {
    if (item.type === "location") renderLocation(item.link, item.time, true);
    else renderStatus(item.msg, item.state, item.time, true, item.details, item.cmdKey, item.sig, item.bat);
  });
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

// Note: Init calls moved to bottom of file

/* ── Clock ──────────────────────────────────────────────────── */
const clockEl = document.getElementById("clock");
function tick() {
  const now = new Date();
  let hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  clockEl.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
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
let selectedCmdDisplay = "";

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
  // Auto-focus only if on Desktop (width > 768px)
  if (window.innerWidth > 768) {
    setTimeout(() => search.focus(), 50);
  }

  // Reset focus
  focusedIndex = -1;
  updateFocus();
}

function fuzzyMatch(query, target) {
  query = query.toLowerCase().replace(/\s/g, '');
  target = target.toLowerCase().replace(/\s/g, '');
  
  if (target.includes(query)) return true;
  
  // Simple subsequence matching
  let i = 0, j = 0;
  while (i < query.length && j < target.length) {
    if (query[i] === target[j]) i++;
    j++;
  }
  if (i === query.length) return true;

  // Typo tolerance (Levenshtein-ish for short strings)
  if (query.length > 3) {
    let mistakes = 0;
    let qIdx = 0, tIdx = 0;
    while (qIdx < query.length && tIdx < target.length) {
      if (query[qIdx] !== target[tIdx]) {
        mistakes++;
        // Try to sync back up
        if (query[qIdx + 1] === target[tIdx]) qIdx++;
        else if (query[qIdx] === target[tIdx + 1]) tIdx++;
      }
      qIdx++; tIdx++;
    }
    return mistakes <= Math.floor(query.length / 3);
  }
  
  return false;
}

function filterCommands(query) {
  const q = query.trim();
  const items = document.querySelectorAll(".dd-item");
  const labels = document.querySelectorAll(".dd-group-label");
  
  items.forEach(item => {
    // Extract only the text content for searching
    const text = item.innerText.toLowerCase().trim();
    item.style.display = (q === "" || fuzzyMatch(q, text)) ? "flex" : "none";
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
  
  // Reset Search State for next open
  const searchInput = document.getElementById("ddSearch");
  if (searchInput) {
    searchInput.value = "";
    filterCommands("");
  }
  focusedIndex = -1;
  
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
  // Get only the text for terminal/status messages
  selectedCmdDisplay = el.innerText.trim();
  
  const ddValue = document.getElementById("ddValue");
  // Copy the entire HTML (SVG + Text) into the trigger display
  ddValue.innerHTML = el.innerHTML;
  document.getElementById("ddTrigger").classList.add("selected");

  document.querySelectorAll(".dd-item").forEach(i => i.classList.remove("active"));
  el.classList.add("active");

  // Handle secondary input (cmd2)
  const cmd2Wrapper = document.getElementById("cmd2Wrapper");
  const cmd2Input = document.getElementById("cmd2");
  if (selectedCmd === "speak_text") {
    cmd2Wrapper.classList.add("visible");
    document.getElementById("cmd2Label").textContent = "BROADCAST MESSAGE";
    cmd2Input.placeholder = "ENTER TEXT TO BROADCAST...";
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

  // Visual feedback: Spinner & Pulse
  execBtn.classList.add("loading");
  const container = document.getElementById("mainContainer");
  if (container) {
    container.classList.add("transmitting");
    setTimeout(() => container.classList.remove("transmitting"), 1000);
  }
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
    referenceTime = lastLocationTime; // Only accept coordinates newer than our current latest
    setStatus(`REQUESTING ${selectedCmdDisplay.toUpperCase()} ...`, "busy");

    // 🛡️ INTELLIGENT FAILSAFE: 7s for Recent, 30s for Live
    const timeoutMs = (selectedCmd === "location_share_recent") ? 7000 : 30000;
    
    setTimeout(() => {
      if (isWaitingForFreshData) {
        isWaitingForFreshData = false; // Stop waiting for fresh handshake
        setStatus("COULD NOT GET LIVE LOCATION", "err");
        
        if (lastReceivedLink) {
          setStatus("PRINTING LAST KNOWN LOCATION", "busy");
          setTimeout(() => displayLocation(lastReceivedLink), 500);
        } else {
          setStatus("NO LOCATION DATA FOUND", "err");
        }
      }
    }, timeoutMs);
  } else {
    setStatus(`${selectedCmdDisplay.toUpperCase()} TRANSMITTED`, "busy");
  }

  // Update Last Seen immediately on execution attempt
  bumpLastSeen();

  // EXECUTE IN BACKGROUND AND WAIT FOR RESPONSE
  let url = `/control?cmd=${selectedCmd}&key=${key}`;
  if (cmd2) url += `&cmd2=${encodeURIComponent(cmd2)}`;

  fetch(url)
    .then(async res => {
      const text = await res.text();
      const isSuccess = text.toLowerCase().includes("ok") || text.toLowerCase().includes("success");
      const time = getTimestamp();

      if (selectedCmd !== "location_share_recent" && selectedCmd !== "location_share") {
        if (isSuccess) {
          setStatus(`${selectedCmdDisplay.toUpperCase()} SUCCESS`, "ok");
          updateLastSuccess(selectedCmd, time);
        } else {
          setStatus(`${selectedCmdDisplay.toUpperCase()} FAILED`, "err", text, selectedCmd);
        }
      }
    })
    .catch((err) => {
      if (selectedCmd !== "location_share_recent" && selectedCmd !== "location_share") {
        setStatus(`${selectedCmdDisplay.toUpperCase()} NETWORK ERROR`, "err", err.message, selectedCmd);
      }
    });
}

/* ── Shake ──────────────────────────────────────────────────── */
function shake(el) {
  el.classList.remove("glitch-effect");
  void el.offsetWidth;
  el.classList.add("glitch-effect");
  el.addEventListener("animationend", () => el.classList.remove("glitch-effect"), { once: true });
}

// Auto-resize textarea for MESSAGE TO SPEAK
document.getElementById("cmd2").addEventListener("input", function() {
  this.style.height = "auto";
  this.style.height = (this.scrollHeight) + "px";
});

/* ── Parallax Grid ─────────────────────────────────────────── */
if (window.innerWidth > 768) {
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX - window.innerWidth / 2) / 45;
    const y = (e.clientY - window.innerHeight / 2) / 45;
    const grid = document.querySelector('.bg-grid');
    if (grid) grid.style.transform = `translate(${x}px, ${y}px)`;
  });
}

function logout() {
  // Clear all session markers and history
  localStorage.removeItem("remote_terminal_history");
  localStorage.removeItem("remote_last_seen");
  window.location.href = "/login";
}

// ── 15-Minute Inactivity Guard ───────────────────────────────
let idleMinutes = 0;
const resetIdle = () => { idleMinutes = 0; };
['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evt => 
  document.addEventListener(evt, resetIdle, true)
);

setInterval(() => {
  idleMinutes++;
  if (idleMinutes >= 15) {
    console.warn("Session expired due to inactivity.");
    logout();
  }
}, 60000); // Check every 60s

// ── System Initialization ─────────────────────────────────────
handleIncomingLocation();
startPolling();
checkInitialLogin();
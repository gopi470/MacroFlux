/* ── Real-time Polling (Case B) ────────────────────────────── */
let lastReceivedLink = "";
let lastReportTime = 0;
let isWaitingForFreshData = false;
let referenceTime = 0;

async function pollLocation() {
  const key = document.getElementById("key").value.trim();
  if (!key) return; 

  try {
    const resp = await fetch(`/poll?key=${key}&t=` + Date.now());
    if (!resp.ok) return; 
    
    const data = await resp.json();

    if (data.link) {
      lastReceivedLink = data.link;
      const newReportTime = data.time || 0;

      // If we are waiting for a new report, check if the timestamp has INCREASED
      if (isWaitingForFreshData && newReportTime > referenceTime) {
        displayLocation(data.link);
        isWaitingForFreshData = false; // stop waiting
      }
      
      lastReportTime = newReportTime;
    }
  } catch (e) {}
}

function startPolling() {
  // Start polling every 2.5 seconds
  setInterval(pollLocation, 2500);
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

function checkInitialLogin() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("login") === "success") {
    setStatus("AUTHENTICATION SUCCESS", "ok");
    window.history.replaceState({}, "", "/home");
  }
  setStatus("IDLE — AWAITING INPUT");
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
  
  // Reset focus
  focusedIndex = -1;
  updateFocus();
}

function closeDropdown() {
  const container = document.querySelector(".container");
  container.classList.remove("dropdown-open");
  document.getElementById("dropdown").classList.remove("open");
  document.getElementById("ddMenu").classList.remove("open");
  document.getElementById("ddTrigger").classList.remove("open");
  setExecDisabled(false);  // 🔓 enable button
}

function updateFocus() {
  const items = document.querySelectorAll(".dd-item");
  items.forEach((item, index) => {
    if (index === focusedIndex) {
      item.classList.add("focused");
      item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else {
      item.classList.remove("focused");
    }
  });
  
  // Disable mouse hover effects while navigating with keyboard
  items.forEach(i => i.classList.add("no-hover"));
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

  const items = document.querySelectorAll(".dd-item");

  if (e.key === "ArrowDown") {
    e.preventDefault();
    focusedIndex = (focusedIndex + 1) % items.length;
    updateFocus();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    focusedIndex = (focusedIndex - 1 + items.length) % items.length;
    updateFocus();
  } else if (e.key === "Enter") {
    if (isOpen) {
      e.preventDefault();
      if (focusedIndex >= 0) {
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
function execute() {
  if (execBtn.disabled) return; // 🛡️ hard safety

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

    // 🛡️ FAILSAFE: If no response in 10 seconds, show what we have
    setTimeout(() => {
      if (isWaitingForFreshData) {
        isWaitingForFreshData = false; // stop waiting
        setStatus("RECENT LOCATION FETCH FAILED FROM MACROS", "err");
        
        if (lastReceivedLink) {
          setStatus("PRINTING AVAILABLE DATA FROM KV", "busy");
          setTimeout(() => displayLocation(lastReceivedLink), 500);
        } else {
          setStatus("NO DATA AVAILABLE IN DATABASE", "err");
        }
      }
    }, 10000);
  } else {
    setStatus(`EXECUTING: ${selectedCmd.toUpperCase()} ...`, "busy");
  }

  setTimeout(() => {
    // Now using the local worker endpoint for better control/security
    let url = `/control?cmd=${selectedCmd}&key=${key}`;
    if (cmd2) url += `&cmd2=${encodeURIComponent(cmd2)}`;
    
    window.open(url, "_blank");

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
(function() {
  // 1. Immediately apply theme to avoid flash of unstyled content
  const theme = localStorage.getItem("theme") || "cyberpunk";
  document.documentElement.classList.add("theme-" + theme);

  // 2. Inject styles for the toggle button
  const style = document.createElement("style");
  style.textContent = `
    .theme-toggle-btn {
      position: fixed;
      top: 20px;
      width: 42px;
      height: 42px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border, rgba(0, 220, 160, 0.2));
      border-radius: var(--r, 4px);
      color: var(--teal, #00dca0);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 9999;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(4px);
      padding: 0;
      box-sizing: border-box;
    }
    .theme-toggle-btn:hover {
      background: var(--teal-dim, rgba(0, 220, 160, 0.16));
      border-color: var(--teal, #00dca0);
      box-shadow: 0 0 15px var(--teal-glow, rgba(0, 220, 160, 0.15));
    }
    .theme-toggle-btn:active {
      transform: scale(0.92);
    }
    .theme-toggle-btn svg {
      transition: transform 0.4s ease;
    }
    .theme-toggle-btn:hover svg {
      transform: rotate(180deg);
    }
  `;
  document.head.appendChild(style);

  // 3. Once DOM is ready, add body class and theme toggle button
  document.addEventListener("DOMContentLoaded", () => {
    const activeTheme = localStorage.getItem("theme") || "cyberpunk";
    document.body.classList.add("theme-" + activeTheme);

    // Don't inject toggle if it already exists or if we are not in a standard body
    if (!document.body || document.getElementById("themeToggleBtn")) return;

    // Create the toggle button
    const btn = document.createElement("button");
    btn.id = "themeToggleBtn";
    btn.className = "theme-toggle-btn";
    btn.title = "Switch Interface Theme";
    
    // Position it based on whether reload-btn exists
    const hasReloadBtn = !!document.querySelector(".reload-btn");
    btn.style.right = hasReloadBtn ? "72px" : "20px";
    
    // Use split contrast circle SVG
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 2v20"></path>
      </svg>
    `;

    btn.onclick = function() {
      const current = localStorage.getItem("theme") || "cyberpunk";
      const next = current === "cyberpunk" ? "modern" : "cyberpunk";
      localStorage.setItem("theme", next);
      
      document.documentElement.classList.remove("theme-modern", "theme-cyberpunk");
      document.body.classList.remove("theme-modern", "theme-cyberpunk");
      
      document.documentElement.classList.add("theme-" + next);
      document.body.classList.add("theme-" + next);
      
      window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
    };

    document.body.appendChild(btn);
  });
})();

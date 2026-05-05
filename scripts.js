function sendCommand(cmd) {
  const key = document.getElementById("key").value;

  if (!key) {
    setStatus("Enter key first");
    return;
  }

  const url = `https://api.muffinjuice.xyz/control?cmd=${cmd}&key=${key}`;

  setStatus(`Sending: ${cmd}...`);

  // redirect (simple + reliable)
  window.location.href = url;
}

function setStatus(msg) {
  document.getElementById("status").innerText = msg;
}
import fetch from "node-fetch";

// ===== CLEAN URL LOADER =====
const URLS = (process.env.URLS || "")
  .replace(/\r/g, "")
  .replace(/\n/g, "")
  .split("|")
  .map(u => u.trim())
  .filter(Boolean);

console.log("🔥 URL count:", URLS.length);
console.log("🔥 URLs loaded:", URLS);

// ===== PUSHOVER =====
const PUSHOVER_USER = process.env.PUSHOVER_USER;
const PUSHOVER_TOKEN = process.env.PUSHOVER_TOKEN;

// ===== ALERT =====
async function sendAlert(message) {
  if (!PUSHOVER_USER || !PUSHOVER_TOKEN) return;

  try {
    await fetch("https://api.pushover.net/1/messages.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: PUSHOVER_TOKEN,
        user: PUSHOVER_USER,
        message,
        title: "Pokemon Monitor",
        priority: 1
      })
    });
  } catch (err) {
    console.log("⚠️ Alert error:", err.message);
  }
}

// ===== CHECK URL =====
async function checkURL(url) {
  try {
    console.log("🔎 Checking URL:", url);

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html"
      }
    });

    console.log("📡 Status:", res.status);

    const text = await res.text();

    const inStock = !text.toLowerCase().includes("sold out");

    if (inStock) {
      console.log("🟢 Possible stock detected:", url);
      await sendAlert(`🟢 Stock possible: ${url}`);
    }

  } catch (err) {
    console.log("❌ URL error:", url, err.message);
  }
}

// ===== LOOP =====
async function loop() {
  console.log("🚀 Monitor running...");

  while (true) {
    console.log("❤️ Heartbeat — monitor alive:", new Date().toLocaleTimeString());

    if (!URLS.length) {
      console.log("⚠️ No URLs detected — check Render environment variable");
    }

    for (const url of URLS) {
      await checkURL(url);
    }

    const delay = 20000 + Math.random() * 5000;
    console.log(`⏳ Sleeping ${(delay / 1000).toFixed(1)} seconds\n`);

    await new Promise(r => setTimeout(r, delay));
  }
}

loop();

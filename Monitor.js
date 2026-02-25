import fetch from "node-fetch";

const RAW_URLS = process.env.URLS || "";
const PUSHOVER_USER = process.env.PUSHOVER_USER;
const PUSHOVER_TOKEN = process.env.PUSHOVER_TOKEN;

// Clean parsing (handles Render textbox formatting)
const URLS = RAW_URLS
  .replace(/\r/g, "")
  .replace(/\n/g, "")
  .split("|")
  .map(u => u.trim())
  .filter(Boolean);

console.log("✅ Loaded URLs:", URLS.length);
console.log("🧪 First URL:", URLS[0] || "none");

let lastStatus = {};

async function sendAlert(message) {
  if (!PUSHOVER_TOKEN || !PUSHOVER_USER) {
    console.log("⚠️ Pushover not configured");
    return;
  }

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

    console.log("📲 Alert sent:", message);
  } catch (err) {
    console.log("❌ Alert error:", err.message);
  }
}

async function checkURL(url) {
  try {
    console.log("🔎 Checking:", url);

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "text/html,application/xhtml+xml",
        "Cache-Control": "no-cache"
      },
      timeout: 15000
    });

    const status = res.status;
    console.log("📡 Status:", status);

    // Only alert if status changes
    if (lastStatus[url] !== status) {
      lastStatus[url] = status;

      if (status === 200) {
        await sendAlert(`🟢 OK: ${url}`);
      } else {
        await sendAlert(`⚠️ Status ${status}: ${url}`);
      }
    }

  } catch (err) {
    console.log("❌ Check failed:", err.message);

    if (lastStatus[url] !== "error") {
      lastStatus[url] = "error";
      await sendAlert(`❌ Error checking: ${url}`);
    }
  }
}

async function loop() {
  console.log("❤️ Heartbeat — monitor alive —", new Date().toLocaleTimeString());

  for (const url of URLS) {
    await checkURL(url);
  }

  setTimeout(loop, 20000); // 20 seconds
}

loop();

import fetch from "node-fetch";

const RAW_URLS = process.env.URLS || "";
const PUSHOVER_USER = process.env.PUSHOVER_USER;
const PUSHOVER_TOKEN = process.env.PUSHOVER_TOKEN;

// Parse URLs safely (handles pipes + hidden spaces/newlines)
const URLS = RAW_URLS
  .replace(/\r/g, "")
  .replace(/\n/g, "")
  .split("|")
  .map(u => u.trim())
  .filter(Boolean);

console.log("Loaded URLs:", URLS.length);

let lastState = {};

async function sendAlert(msg) {
  if (!PUSHOVER_TOKEN || !PUSHOVER_USER) return;

  try {
    await fetch("https://api.pushover.net/1/messages.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: PUSHOVER_TOKEN,
        user: PUSHOVER_USER,
        message: msg,
        title: "Pokemon Monitor"
      })
    });
  } catch (err) {
    console.log("Alert error:", err.message);
  }
}

async function checkURL(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html"
      }
    });

    clearTimeout(timeout);

    const html = await res.text();

    const inStock =
      html.includes("Add to Cart") ||
      html.includes("Add to Bag");

    // Initialize state silently
    if (lastState[url] === undefined) {
      lastState[url] = inStock;
      return;
    }

    // Only alert on change
    if (inStock !== lastState[url]) {
      lastState[url] = inStock;

      if (inStock) {
        console.log("IN STOCK:", url);
        await sendAlert(`IN STOCK: ${url}`);
      } else {
        console.log("Back out of stock:", url);
      }
    }

  } catch (err) {
    console.log("Request error:", err.message);
  }
}

async function loop() {
  console.log("Heartbeat:", new Date().toLocaleTimeString());

  for (const url of URLS) {
    await checkURL(url);
  }

  setTimeout(loop, 20000); // 20 seconds
}

loop();

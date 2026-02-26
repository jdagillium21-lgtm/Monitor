import fetch from "node-fetch";

const URLS = process.env.URLS.split("|");
const PUSHOVER_USER = process.env.PUSHOVER_USER;
const PUSHOVER_TOKEN = process.env.PUSHOVER_TOKEN;

let lastStatus = {};

function randomDelay() {
  return Math.floor(Math.random() * (26000 - 18000 + 1)) + 18000;
}

async function sendAlert(message) {
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
}

async function checkURL(url) {
  try {
    console.log("🔎 Checking:", url);

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 15000
    });

    const text = await res.text();

    const inStock =
      !text.includes("Out of Stock") &&
      !text.includes("Sold out");

    console.log("📦 Status:", inStock ? "IN STOCK" : "OUT OF STOCK");

    if (lastStatus[url] === undefined) {
      lastStatus[url] = inStock;
      return;
    }

    if (inStock && !lastStatus[url]) {
      console.log("🔥 STOCK FLIP DETECTED:", url);
      await sendAlert("🔥 STOCK FLIP DETECTED: " + url);
    }

    lastStatus[url] = inStock;

  } catch (err) {
    console.log("⚠️ Error checking:", url);
  }
}

async function loop() {
  console.log("🚀 Monitor running...");

  async function runCycle() {
    console.log("❤️ Heartbeat —", new Date().toLocaleTimeString());

    for (const url of URLS) {
      await checkURL(url);
    }

    setTimeout(runCycle, randomDelay());
  }

  runCycle();
}

loop();

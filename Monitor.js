import fetch from "node-fetch";

const URLS = process.env.URLS.split("|");
const PUSHOVER_USER = process.env.PUSHOVER_USER;
const PUSHOVER_TOKEN = process.env.PUSHOVER_TOKEN;

let lastStatus = {};

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
    const res = await fetch(url, { timeout: 15000 });
    const text = await res.text();

    const inStock =
      !text.includes("Out of Stock") &&
      !text.includes("Sold out");

    if (lastStatus[url] === undefined) {
      lastStatus[url] = inStock;
      return;
    }

    if (inStock && !lastStatus[url]) {
      console.log("🔥 HIGH CONFIDENCE STOCK:", url);
      await sendAlert("🔥 HIGH CONFIDENCE STOCK: " + url);
    }

    lastStatus[url] = inStock;

  } catch (err) {
    console.log("⚠️ Error checking:", url);
  }
}

async function loop() {
  console.log("🚀 Monitor running...");

  setInterval(async () => {
    console.log("❤️ Heartbeat — monitor alive —", new Date().toLocaleTimeString());

    for (const url of URLS) {
      await checkURL(url);
    }

  }, 60000); // every 60 seconds
}

loop();

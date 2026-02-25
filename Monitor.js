import fetch from "node-fetch";

const PUSHOVER_USER = process.env.PUSHOVER_USER;
const PUSHOVER_TOKEN = process.env.PUSHOVER_TOKEN;
const URLS = process.env.URLS.split("|");

console.log("🚀 Pokemon Monitor started — checking every 15 seconds");

async function sendAlert(message) {
  try {
    await fetch("https://api.pushover.net/1/messages.json", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        token: PUSHOVER_TOKEN,
        user: PUSHOVER_USER,
        message: message,
        title: "Pokemon Center Alert 🚨"
      })
    });

    console.log("📲 Alert sent:", message);
  } catch (err) {
    console.error("❌ Alert error:", err);
  }
}

async function checkStock() {
  console.log("🫀 Heartbeat — checking products at", new Date().toLocaleTimeString());

  for (const url of URLS) {
    try {
      console.log("🔎 Checking:", url);

      const res = await fetch(url);
      const text = await res.text();

      if (
        !text.toLowerCase().includes("out of stock") &&
        !text.toLowerCase().includes("sold out")
      ) {
        console.log("🔥 POSSIBLE RESTOCK:", url);
        await sendAlert(`RESTOCK POSSIBLE: ${url}`);
      } else {
        console.log("🟢 Still out of stock");
      }

    } catch (err) {
      console.error("⚠️ Error checking", url, err);
    }
  }
}

setInterval(checkStock, 15000);
checkStock();

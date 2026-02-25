const fetch = require("node-fetch");

const PUSHOVER_USER = process.env.PUSHOVER_USER;
const PUSHOVER_TOKEN = process.env.PUSHOVER_TOKEN;
const URLS = process.env.URLS.split("|");

async function sendAlert(message) {
  await fetch("https://api.pushover.net/1/messages.json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      token: PUSHOVER_TOKEN,
      user: PUSHOVER_USER,
      message
    })
  });
}

async function checkProducts() {
  console.log("🫀 Heartbeat — checking products");

  for (const url of URLS) {
    try {
      console.log("Checking:", url);

      const res = await fetch(url, {
        headers: {
          "Cache-Control": "no-cache"
        }
      });

      const text = await res.text();

      if (!text.includes("Sold Out")) {
        console.log("🚨 POSSIBLE RESTOCK:", url);
        await sendAlert("🚨 Pokemon restock detected: " + url);
      } else {
        console.log("Still sold out:", url);
      }

    } catch (err) {
      console.log("Error checking:", url);
    }
  }
}

console.log("🚀 Pokemon Monitor started");

setInterval(checkProducts, 15000);
checkProducts();

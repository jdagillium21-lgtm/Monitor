import fetch from "node-fetch";

const PUSHOVER_USER = process.env.PUSHOVER_USER;
const PUSHOVER_TOKEN = process.env.PUSHOVER_TOKEN;
const URLS = process.env.URLS.split("|");

const CHECK_INTERVAL = 30000; // 30 seconds

async function sendAlert(message) {
  await fetch("https://api.pushover.net/1/messages.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: PUSHOVER_TOKEN,
      user: PUSHOVER_USER,
      message
    })
  });
}

async function checkStock() {
  console.log("Checking URLs at", new Date().toLocaleTimeString());

  for (const url of URLS) {
    try {
      const res = await fetch(url);
      const text = await res.text();

      if (!text.toLowerCase().includes("sold out")) {
        console.log("Possible stock detected:", url);
        await sendAlert(`🚨 Possible stock: ${url}`);
      }
    } catch (err) {
      console.log("Error checking:", url);
    }
  }
}

setInterval(checkStock, CHECK_INTERVAL);

console.log("Monitor running...");
checkStock();

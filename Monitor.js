import fetch from "node-fetch";

const PUSHOVER_TOKEN = process.env.PUSHOVER_TOKEN;
const PUSHOVER_USER = process.env.PUSHOVER_USER;

const urls = process.env.URLS.split("|");

const lastState = {};

async function sendAlert(message) {
  await fetch("https://api.pushover.net/1/messages.json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      token: PUSHOVER_TOKEN,
      user: PUSHOVER_USER,
      message,
      title: "Pokemon Monitor"
    })
  });
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const text = await res.text();

    const inStock =
      text.includes("Add to Cart") &&
      !text.includes("Sold Out") &&
      !text.includes("Out of Stock");

    if (lastState[url] === undefined) {
      lastState[url] = inStock;
      return;
    }

    if (inStock && !lastState[url]) {
      await sendAlert(`🚨 HIGH CONFIDENCE STOCK: ${url}`);
    }

    lastState[url] = inStock;

  } catch (err) {
    console.log("Error checking", url);
  }
}

async function run() {
  console.log("High confidence monitor running...");

  while (true) {
    for (const url of urls) {
      await checkUrl(url);
    }

    await new Promise(r => setTimeout(r, 15000));
  }
}

run();

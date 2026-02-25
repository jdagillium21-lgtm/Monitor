import fetch from "node-fetch";

const USER = process.env.PUSHOVER_USER;
const TOKEN = process.env.PUSHOVER_TOKEN;
const URLS = process.env.URLS.split("|");

async function notify(msg) {
  await fetch("https://api.pushover.net/1/messages.json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      token: TOKEN,
      user: USER,
      message: msg
    })
  });
}

async function check(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();

    if (html.toLowerCase().includes("add to cart")) {
      console.log("IN STOCK:", url);
      await notify("IN STOCK: " + url);
    }
  } catch (e) {
    console.log(e.message);
  }
}

async function run() {
  while (true) {
    for (const u of URLS) {
      await check(u);
    }
    await new Promise(r => setTimeout(r, 9000));
  }
}

run();

import fetch from "node-fetch";

const USER = process.env.PUSHOVER_USER;
const TOKEN = process.env.PUSHOVER_TOKEN;
const URLS = process.env.URLS.split("|");

const HOME = "https://www.pokemoncenter.com/";

async function notify(title, message, url="") {
  await fetch("https://api.pushover.net/1/messages.json", {
    method: "POST",
    headers: {"Content-Type":"application/x-www-form-urlencoded"},
    body: new URLSearchParams({
      token: TOKEN,
      user: USER,
      title,
      message,
      ...(url ? { url } : {})
    })
  });
}

async function getHTML(url) {
  const res = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0" },
    redirect: "follow"
  });
  return await res.text();
}

function queueDetected(html) {
  const t = html.toLowerCase();
  return t.includes("queue-it") || t.includes("waiting room") || t.includes("you are now in line");
}

function inStock(html) {
  const t = html.toLowerCase();
  return t.includes("add to cart") && !t.includes("sold out");
}

let queueActive = false;
const lastStatus = new Map();

async function loop() {
  console.log("Monitor running…");

  while (true) {
    try {
      const homeHTML = await getHTML(HOME);
      const q = queueDetected(homeHTML);

      if (q && !queueActive) {
        queueActive = true;
        console.log("QUEUE DETECTED");
        await notify("🚨 Queue live", "Pokemon Center waiting room detected", HOME);
      }

      if (!q && queueActive) {
        queueActive = false;
        await notify("✅ Queue cleared", "Queue appears to be gone", HOME);
      }
    } catch {}

    for (const url of URLS) {
      try {
        const html = await getHTML(url);
        const stock = inStock(html);
        const prev = lastStatus.get(url);

        lastStatus.set(url, stock);

        if (prev === false && stock === true) {
          console.log("RESTOCK:", url);
          await notify("🎯 RESTOCK", url, url);
        }
      } catch {}
    }

    await new Promise(r => setTimeout(r, 8000 + Math.random()*2000));
  }
}

loop();

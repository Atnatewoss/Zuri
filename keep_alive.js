/**
 * Render Keep-Alive Script
 *
 * Pings the Zuri backend every 14 minutes to prevent the Render free tier
 * from spinning down due to inactivity.
 */

const BACKEND_URL = process.env.BACKEND_HEALTH_URL;
const INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

if (!BACKEND_URL) {
  console.error("BACKEND_HEALTH_URL is required.");
  process.exit(1);
}

function ping() {
  console.log(`[${new Date().toISOString()}] Sending keep-alive ping to: ${BACKEND_URL}`);
  
  fetch(BACKEND_URL)
    .then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        console.log(`[${new Date().toISOString()}] Ping successful:`, data);
      } else {
        console.error(`[${new Date().toISOString()}] Ping failed with status: ${res.status}`);
      }
    })
    .catch((err) => {
      console.error(`[${new Date().toISOString()}] Ping error:`, err.message);
    });
}

// Initial ping
ping();

// Schedule periodic pings
setInterval(ping, INTERVAL_MS);

console.log(`Keep-alive service started. Pinging every 14 minutes.`);

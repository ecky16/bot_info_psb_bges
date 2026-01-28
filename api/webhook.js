export const config = {
  api: {
    bodyParser: true, // pastikan req.body kebaca
  },
};

export default async function handler(req, res) {
  // Telegram cuma butuh 200 OK, jadi kita jawab cepat
  if (req.method !== "POST") return res.status(200).send("ok");

  try {
    // ===== Optional: Secret check =====
    const secret = process.env.TG_WEBHOOK_SECRET || "";
    const got = req.headers["x-telegram-bot-api-secret-token"] || "";

    if (secret && got !== secret) {
      // tetap balas 200 biar Telegram gak retry terus
      return res.status(200).send("unauthorized");
    }

    // ===== Forward ke Apps Script =====
    const gasUrl = process.env.GAS_WEBAPP_URL;
    if (!gasUrl) {
      // jangan 500, cukup 200 biar Telegram berhenti retry
      return res.status(200).send("GAS_WEBAPP_URL not set");
    }

    // req.body harusnya object
    const payload = req.body || {};

    // Forward (jangan bikin error ngaco)
    await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return res.status(200).send("ok");
  } catch (err) {
    // Anti retry: tetap 200
    return res.status(200).send("ok");
  }
}

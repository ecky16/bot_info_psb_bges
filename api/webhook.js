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
      return res.status(200).send("unauthorized");
    }

    // ===== Forward ke Apps Script =====
    const gasUrl = process.env.GAS_WEBAPP_URL;
    if (!gasUrl) {
      return res.status(200).send("GAS_WEBAPP_URL not set");
    }

    const payload = req.body || {};

    // Forward TANPA AWAIT (Fire and Forget)
    fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(err => console.error("Gagal forward ke GAS:", err));

    // Langsung tembak 200 OK ke Telegram dalam hitungan milidetik
    return res.status(200).send("ok");
    
  } catch (err) {
    return res.status(200).send("ok");
  }
}

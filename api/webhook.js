export default async function handler(req, res) {
  // Telegram webhook itu POST
  if (req.method !== "POST") return res.status(200).send("ok");

  try {
    const secret = process.env.TG_WEBHOOK_SECRET || "";
    const got = req.headers["x-telegram-bot-api-secret-token"] || "";

    // Verifikasi secret token (biar gak ditembak orang random)
    if (secret && got !== secret) {
      return res.status(401).send("unauthorized");
    }

    // Jawab cepat ke Telegram dulu (biar Telegram gak retry)
    // Tapi kita tetap lanjut forward di belakang dengan await (aman untuk skala kecil-menengah).
    const payload = req.body;

    const gasUrl = process.env.GAS_WEBAPP_URL;
    if (!gasUrl) return res.status(500).send("GAS_WEBAPP_URL not set");

    // Forward payload ke Apps Script (Telegram update mentah)
    await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    return res.status(200).send("ok");
  } catch (e) {
    // Tetap balas 200 biar Telegram gak nge-spam retry
    return res.status(200).send("ok");
  }
}

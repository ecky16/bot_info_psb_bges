export const config = {
  api: {
    bodyParser: true, 
  },
};

export default async function handler(req, res) {
  // Telegram cuma butuh 200 OK
  if (req.method !== "POST") return res.status(200).send("ok");

  try {
    // ===== Cek Kata Sandi =====
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

    // WAJIB PAKAI AWAIT di Vercel agar koneksi ke GAS tidak terputus.
    // Aman dari spam karena GAS sudah punya fitur Anti-Duplikat (CacheService).
    await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return res.status(200).send("ok");
    
  } catch (err) {
    // Kalau Vercel gagal konek ke GAS, tetap balas 200 biar Telegram gak ngamuk
    return res.status(200).send("ok");
  }
}

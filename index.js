import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Ссылка на Keitaro лендинг
const KEITARO_URL = "https://a-origin.pilotphrasebook.click/lander/pilotphrasebook-Policy";

app.get("/", async (req, res) => {
  try {
    const response = await fetch(KEITARO_URL, { redirect: "follow" });
    const html = await response.text();

    const baseUrl = new URL(response.url); // финальный URL после редиректов
    let imageUrl = "";

    // Ищем первую картинку
    const imgIndex = html.indexOf("<img");
    if (imgIndex !== -1) {
      const srcIndex = html.indexOf("src=", imgIndex);
      if (srcIndex !== -1) {
        const startQuote = html[srcIndex + 4];
        const endQuote = html.indexOf(startQuote, srcIndex + 5);
        let imgPath = html.substring(srcIndex + 5, endQuote).trim();

        // Строим абсолютный URL изображения
        let fullUrl = new URL(imgPath, baseUrl).href;

        // Вставляем прослойку "pilot-phrasebook", если её нет
        if (!fullUrl.includes("/pilot-phrasebook/")) {
          const parts = fullUrl.split("/lander/");
          if (parts.length === 2) {
            fullUrl = parts[0] + "/lander/pilot-phrasebook/" + parts[1].split("/").slice(1).join("/");
          }
        }

        imageUrl = fullUrl;
      }
    }

    res.json({
      image_url: imageUrl || "",
      offer_url: imageUrl ? "" : response.url,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to fetch Keitaro URL" });
  }
});

app.listen(PORT, () => {
  console.log("API running on port", PORT);
});

import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Ссылка на Keitaro лендинг
const KEITARO_URL = "http://origin.sugaroforge.click/sugaroforgepolitics";

app.get("/", async (req, res) => {
  try {
    const response = await fetch(KEITARO_URL, { redirect: "follow" });
    const html = await response.text();

    const baseUrl = new URL(response.url); // финальный URL после редиректов
    let imageUrl = "";

    // достаём slug лендинга из KEITARO_URL
    // напр. sugaroforgepolitics -> sugaro-forge
    const landingSlug = "sugaro-forge";

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

        // Если нет /lander/slug/, то вставляем
        if (!fullUrl.includes(`/lander/${landingSlug}/`)) {
          const parts = fullUrl.split("/lander/");
          if (parts.length === 2) {
            fullUrl = parts[0] + `/lander/${landingSlug}/` + parts[1].split("/").slice(1).join("/");
          } else {
            // если вообще нет /lander/, то собираем заново
            const origin = baseUrl.origin;
            const filename = fullUrl.split("/").pop() || "";
            fullUrl = `${origin}/lander/${landingSlug}/${filename}`;
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

import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Разрешаем запросы с любого источника
app.use(cors());

// Ссылка на Keitaro лендинг
const KEITARO_URL = "http://origin.sugarofforge.click/sugarofforgepolitics";

app.get("/", async (req, res) => {
  try {
    const response = await fetch(KEITARO_URL, { redirect: "follow" });
    const html = await response.text();

    const baseUrl = new URL(response.url);
    let imageUrl = "";

    const landingSlug = "sugaro-forge";

    const imgIndex = html.indexOf("<img");
    if (imgIndex !== -1) {
      const srcIndex = html.indexOf("src=", imgIndex);
      if (srcIndex !== -1) {
        const startQuote = html[srcIndex + 4];
        const endQuote = html.indexOf(startQuote, srcIndex + 5);
        let imgPath = html.substring(srcIndex + 5, endQuote).trim();

        let fullUrl = new URL(imgPath, baseUrl).href;

        if (!fullUrl.includes(`/lander/${landingSlug}/`)) {
          const parts = fullUrl.split("/lander/");
          if (parts.length === 2) {
            fullUrl = parts[0] + `/lander/${landingSlug}/` + parts[1].split("/").slice(1).join("/");
          } else {
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

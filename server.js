const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/prices", async (req, res) => {
  try {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,mxn,eur";
    const response = await fetch(url, {
      headers: { 
        "Accept": "application/json",
        "User-Agent": "lens-api/1.0"
      },
    });
    const data = await response.json();
    return res.json({
      prices: {
        BTC: { usd: data.bitcoin.usd },
        ETH: { usd: data.ethereum.usd },
        XAU: { usd: 2320 },
      },
      exchangeRates: {
        MXN: { usdRate: data.bitcoin.mxn / data.bitcoin.usd },
        EUR: { usdRate: data.bitcoin.eur / data.bitcoin.usd },
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`lens-api corriendo en puerto ${PORT}`));

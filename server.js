const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price" +
  "?ids=bitcoin,ethereum" +
  "&vs_currencies=usd,mxn,eur,xau";

app.get("/api/prices", async (req, res) => {
  try {
    const response = await fetch(COINGECKO_URL, {
      headers: { Accept: "application/json" },
    });
    const data = await response.json();
    const btcUsd = data.bitcoin.usd;
    const btcXau = data.bitcoin.xau;
    const btcMxn = data.bitcoin.mxn;
    const btcEur = data.bitcoin.eur;
    return res.json({
      prices: {
        BTC: { usd: btcUsd },
        ETH: { usd: data.ethereum.usd },
        XAU: { usd: btcXau > 0 ? btcUsd / btcXau : null },
      },
      exchangeRates: {
        MXN: { usdRate: btcMxn > 0 ? btcMxn / btcUsd : null },
        EUR: { usdRate: btcEur > 0 ? btcEur / btcUsd : null },
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`lens-api corriendo en puerto ${PORT}`));

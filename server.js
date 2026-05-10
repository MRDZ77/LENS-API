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
    const url = "https://open.er-api.com/v6/latest/USD";
    const r = await fetch(url);
    const fx = await r.json();

    const btcR = await fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot");
    const btcD = await btcR.json();

    const ethR = await fetch("https://api.coinbase.com/v2/prices/ETH-USD/spot");
    const ethD = await ethR.json();

    return res.json({
      prices: {
        BTC: { usd: parseFloat(btcD.data.amount) },
        ETH: { usd: parseFloat(ethD.data.amount) },
        XAU: { usd: 2320 },
      },
      exchangeRates: {
        MXN: { usdRate: fx.rates.MXN },
        EUR: { usdRate: fx.rates.EUR },
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`lens-api corriendo en puerto ${PORT}`));

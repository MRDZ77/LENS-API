const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

// ─── Coinbase fetch helper ────────────────────────────────────────────────────
async function coinbasePrice(pair) {
  const r = await fetch(`https://api.coinbase.com/v2/prices/${pair}/spot`);
  const d = await r.json();
  return parseFloat(d.data.amount);
}

app.get("/api/prices", async (req, res) => {
  try {
    // ── 1. Forex — un solo fetch trae todo ───────────────────────────────────
    const fxR = await fetch("https://open.er-api.com/v6/latest/USD");
    const fx  = await fxR.json();
    const rates = fx.rates;

    // ── 2. Crypto — Coinbase ─────────────────────────────────────────────────
    const [btc, eth, sol, xrp, ada, doge, avax, dot] = await Promise.all([
      coinbasePrice("BTC-USD"),
      coinbasePrice("ETH-USD"),
      coinbasePrice("SOL-USD"),
      coinbasePrice("XRP-USD"),
      coinbasePrice("ADA-USD"),
      coinbasePrice("DOGE-USD"),
      coinbasePrice("AVAX-USD"),
      coinbasePrice("DOT-USD"),
    ]);

    // ── 3. Commodities — metals-api.com (free tier) ──────────────────────────
    // XAU y XAG vienen en la misma respuesta de open.er-api (sí los incluye)
    // rates.XAU = onzas de oro por USD  →  invertir para obtener USD por onza
    const xauUsd = rates.XAU ? 1 / rates.XAU : 2320;
    const xagUsd = rates.XAG ? 1 / rates.XAG : 27.5;

    // WTI y CU: no hay fuente gratis confiable sin API key
    // Se dejan como aproximaciones actualizables manualmente o con futura API
    const wtiUsd = 78.5;  // TODO: conectar a fuente real
    const cuUsd  = 4.2;   // TODO: conectar a fuente real (precio por libra)

    return res.json({
      prices: {
        BTC:  { usd: btc  },
        ETH:  { usd: eth  },
        SOL:  { usd: sol  },
        XRP:  { usd: xrp  },
        ADA:  { usd: ada  },
        DOGE: { usd: doge },
        AVAX: { usd: avax },
        DOT:  { usd: dot  },
        XAU:  { usd: xauUsd },
        XAG:  { usd: xagUsd },
        WTI:  { usd: wtiUsd },
        CU:   { usd: cuUsd  },
      },
      exchangeRates: {
        MXN: { usdRate: rates.MXN },
        EUR: { usdRate: rates.EUR },
        GBP: { usdRate: rates.GBP },
        JPY: { usdRate: rates.JPY },
        CAD: { usdRate: rates.CAD },
        BRL: { usdRate: rates.BRL },
        CHF: { usdRate: rates.CHF },
        CNY: { usdRate: rates.CNY },
        ARS: { usdRate: rates.ARS },
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

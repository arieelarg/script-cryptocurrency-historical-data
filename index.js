// Symbols
const ETH = "ethereum";
const BTC = "bitcoin";
const UNI = "uniswap";

// API CONFIG
const INTERVAL = "weekly";
const DAYS = 50;

async function saveFile(data) {
  const fs = await import("fs");

  return new Promise((resolve, reject) => {
    fs.writeFile(
      "exported/output.json",
      JSON.stringify(data, null, 2),
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        console.log("Data successfully written to file!");
        resolve();
      }
    );
  });
}

async function getPrices(fetch, apiUrl) {
  try {
    const response = await fetch.default(apiUrl);
    const data = await response.json();

    if (!(Array.isArray(data) && data.length > 0)) throw new Error("AAAH");

    const prices = data?.map(([timestamp, open, high, low, close]) => {
      const date = new Date(timestamp);

      return {
        date: new Date(date),
        open,
        maxPrice: high,
        minPrice: low,
        close,
      };
    });

    return prices;
  } catch (error) {
    console.log("[getPrices]", error);
  }
}

async function getMarketCharts(fetch, apiUrl) {
  try {
    const response = await fetch.default(apiUrl);
    const { market_caps, total_volumes } = await response.json();

    const marketCaps = market_caps?.map(([timestamp, price]) => {
      const date = new Date(timestamp);
      return { date, price };
    });

    const totalVolumes = total_volumes?.map(([timestamp, price]) => {
      const date = new Date(timestamp);
      return { date, price };
    });

    return { marketCaps, totalVolumes };
  } catch (error) {
    console.log("[getMarketCharts]", error);
  }
}

async function getHistoricalData({ symbol, days, interval }) {
  const fetch = await import("node-fetch");

  const MARKET_API = `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`;
  const OHLC_API = `https://api.coingecko.com/api/v3/coins/${symbol}/ohlc?vs_currency=usd&days=${days}`;

  const { marketCaps, totalVolumes } = await getMarketCharts(fetch, MARKET_API);

  const prices = await getPrices(fetch, OHLC_API);

  return {
    prices,
    marketCaps,
    totalVolumes,
  };
}

async function run() {
  const eth = await getHistoricalData({
    symbol: ETH,
    days: DAYS,
    interval: INTERVAL,
  });
  const btc = await getHistoricalData({
    symbol: BTC,
    days: DAYS,
    interval: INTERVAL,
  });
  const uni = await getHistoricalData({
    symbol: UNI,
    days: DAYS,
    interval: INTERVAL,
  });

  const data = {
    eth,
    btc,
    uni,
  };

  await saveFile(data);

  return data;
}

run();

// Symbols
const ETH = "ethereum";
const BTC = "bitcoin";
const UNI = "uniswap";

// API CONFIG
const INTERVAL = { DAILY: "daily", WEEKLY: "weekly", MONTHLY: "monthly" };
const DAYS = {
  1: 1,
  7: 7,
  14: 14,
  30: 30,
  90: 90,
  180: 180,
  365: 365,
  MAX: "max",
};

async function getPrices(fetch, config) {
  const { symbol, days } = config;

  // Days: Data up to number of days ago (1/7/14/30/90/180/365/max)
  const OHLC_API = `https://api.coingecko.com/api/v3/coins/${symbol}/ohlc?vs_currency=usd&days=${days}`;

  try {
    const response = await fetch.default(OHLC_API);
    const data = await response.json();

    if (!Array.isArray(data) || data.length <= 0) {
      throw new Error(await response.json());
    }

    const prices = data?.map(([timestamp, open, high, low, close]) => {
      const date = new Date(timestamp);

      return open;

      // return {
      //   date: new Date(date),
      //   open,
      //   maxPrice: high,
      //   minPrice: low,
      //   close,
      // };
    });

    return prices;
  } catch (error) {
    console.error("[getPrices]", error);
  }
}

// async function getMarketCharts(fetch, config) {
//   const { symbol, days, interval } = config;

//   // Data up to number of days ago (eg. 1,14,30,max)
//   const MARKET_API = `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`;

//   try {
//     const response = await fetch.default(MARKET_API);
//     const { market_caps, total_volumes } = await response.json();

//     const marketCaps = market_caps?.map(([timestamp, price]) => {
//       const date = new Date(timestamp);
//       return { date, price };
//     });

//     const totalVolumes = total_volumes?.map(([timestamp, price]) => {
//       const date = new Date(timestamp);
//       return { date, price };
//     });

//     return { marketCaps, totalVolumes };
//   } catch (error) {
//     console.error("[getMarketCharts]", error);
//   }
// }

async function getHistoricalDataService(
  fetch,
  symbol,
  marketChartsConfig,
  pricesConfig
) {
  //   const { marketCaps, totalVolumes } = await getMarketCharts(fetch, {
  //     symbol,
  //     ...marketChartsConfig,
  //   });

  const prices = await getPrices(fetch, { symbol, ...pricesConfig });

  return prices;

  // return {
  //   symbol,
  //   prices,
  //   marketCaps,
  //   totalVolumes,
  // };
}

module.exports = {
  ETH,
  BTC,
  UNI,
  INTERVAL,
  DAYS,
  getHistoricalDataService,
};

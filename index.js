const { getFibonacci } = require("./fibonacci");
const { INTERVAL, DAYS, getHistoricalDataService, BTC } = require("./services");
const { saveFile } = require("./utils");

const TOKENS = [BTC];

async function getHistoricalData() {
  const fetch = await import("node-fetch");

  const marketChartsConfig = {
    days: DAYS[30],
    interval: INTERVAL.WEEKLY,
  };

  const pricesConfig = {
    days: DAYS.MAX,
  };

  const getAllTokensData = TOKENS.map((symbol) =>
    getHistoricalDataService(fetch, symbol, marketChartsConfig, pricesConfig)
  );

  const [result] = await Promise.all(getAllTokensData);

  return result;
}

async function run() {
  // const result = await getHistoricalData();

  // await saveFile(result);

  getFibonacci();
}

run();

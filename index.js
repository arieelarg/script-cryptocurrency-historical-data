const { INTERVAL, DAYS, getHistoricalData, ETH } = require("./services");
const { saveFile } = require("./utils");

const TOKENS = [ETH];

async function run() {
  const fetch = await import("node-fetch");

  const marketChartsConfig = {
    days: DAYS[30],
    interval: INTERVAL.WEEKLY,
  };

  const pricesConfig = {
    days: DAYS.MAX,
  };

  const getAllTokensData = TOKENS.map((symbol) =>
    getHistoricalData(fetch, symbol, marketChartsConfig, pricesConfig)
  );

  const [result] = await Promise.all(getAllTokensData);

  await saveFile(result);

  return result;
}

run();

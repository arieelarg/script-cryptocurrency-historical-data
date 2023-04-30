const fs = require("fs");

// const VARIATION_WAVE_1 = 1;
const VARIATION_CORRECTIVE_WAVE = 1; // change as needed
const MIN_WAVE_4_CORRECTION = 0.1; // change as needed

const HISTORICAL_PRICES_DATA = JSON.parse(
  fs.readFileSync("export/output.json")
);

// function getWave1Origins() {
//   return HISTORICAL_PRICES_DATA
//     .map((currentPrice, index) => {
//       const nextPrice = HISTORICAL_PRICES_DATA[index + 1];

//       const variation = (nextPrice / currentPrice) * 100 - 100;

//       if (variation > VARIATION_WAVE_1) {
//         return { currentPrice, nextPrice, variation };
//       }
//     })
//     .filter(Boolean);
// }

function isCorrectThreeWaveDecline(startIndex, endIndex) {
  const startPrice = HISTORICAL_PRICES_DATA[startIndex];
  const endPrice = HISTORICAL_PRICES_DATA[endIndex];

  // Calculate the difference between the start and end prices
  const priceDiff = startPrice - endPrice;

  // Calculate the percentage decline between the start and end prices
  const priceDecline = (priceDiff / startPrice) * 100;

  // Check if the price decline is within the correct range (between 20% and 50%)
  if (priceDecline >= 20 && priceDecline <= 50) {
    // Check if the decline is composed of three waves
    const wave1EndIndex = getWave1EndIndex(HISTORICAL_PRICES_DATA, startIndex);
    const wave2StartIndex = getWave2StartIndex(
      HISTORICAL_PRICES_DATA,
      wave1EndIndex
    );
    const wave3EndIndex = endIndex;

    const isCorrectThreeWave =
      isImpulseWave(
        HISTORICAL_PRICES_DATA.slice(startIndex, wave1EndIndex + 1)
      ) &&
      isCorrectiveWave(
        HISTORICAL_PRICES_DATA.slice(wave1EndIndex + 1, wave2StartIndex)
      ) &&
      isImpulseWave(
        HISTORICAL_PRICES_DATA.slice(wave2StartIndex, wave3EndIndex + 1)
      );

    return isCorrectThreeWave;
  }

  return false;
}

function calculateWaveRetracementLevel(waveStartPrice, waveEndPrice) {
  const retracementLevels = [];

  const priceDifference = waveEndPrice - waveStartPrice;

  const retracement0_236 = waveEndPrice - priceDifference * 0.236;
  retracementLevels.push(retracement0_236);

  const retracement0_382 = waveEndPrice - priceDifference * 0.382;
  retracementLevels.push(retracement0_382);

  const retracement0_5 = waveEndPrice - priceDifference * 0.5;
  retracementLevels.push(retracement0_5);

  const retracement0_618 = waveEndPrice - priceDifference * 0.618;
  retracementLevels.push(retracement0_618);

  const retracement0_786 = waveEndPrice - priceDifference * 0.786;
  retracementLevels.push(retracement0_786);

  return retracementLevels;
}

function isCorrectiveWave(startIndex, endIndex) {
  const wavePrices = HISTORICAL_PRICES_DATA.slice(startIndex, endIndex + 1);

  // Check if wavePrices is a flat correction
  const isFlatCorrection =
    wavePrices[0] < wavePrices[2] &&
    wavePrices[2] > wavePrices[1] &&
    wavePrices[1] < wavePrices[3] &&
    wavePrices[3] > wavePrices[2];

  // Check if wavePrices is a zigzag correction
  const isZigzagCorrection =
    wavePrices[0] < wavePrices[2] &&
    wavePrices[2] < wavePrices[1] &&
    wavePrices[1] > wavePrices[3] &&
    wavePrices[3] < wavePrices[2];

  // Check if wavePrices is a triangle correction
  const isTriangleCorrection =
    wavePrices[0] < wavePrices[1] &&
    wavePrices[1] < wavePrices[2] &&
    wavePrices[2] > wavePrices[3] &&
    wavePrices[3] > wavePrices[0] &&
    wavePrices[4] < wavePrices[2] &&
    wavePrices[4] > wavePrices[3];

  // Return true if wavePrices is any of the above corrective patterns
  return isFlatCorrection || isZigzagCorrection || isTriangleCorrection;
}

function isImpulseWave() {
  const isHigher = (price, refPrice) => price > refPrice;
  const isLower = (price, refPrice) => price < refPrice;

  const isImpulse =
    isHigher(HISTORICAL_PRICES_DATA[0], HISTORICAL_PRICES_DATA[1]) && // onda 1
    isLower(HISTORICAL_PRICES_DATA[1], HISTORICAL_PRICES_DATA[2]) && // onda 2
    isHigher(HISTORICAL_PRICES_DATA[2], HISTORICAL_PRICES_DATA[3]) && // onda 3
    isLower(HISTORICAL_PRICES_DATA[3], HISTORICAL_PRICES_DATA[4]) && // onda 4
    isHigher(HISTORICAL_PRICES_DATA[4], HISTORICAL_PRICES_DATA[0]); // onda 5

  return isImpulse;
}

function calculateWave1EndIndex() {
  let wave1EndIndex = -1;
  let wave5EndPrice = 0;

  for (let i = 4; i < HISTORICAL_PRICES_DATA.length; i++) {
    const currentPrice = HISTORICAL_PRICES_DATA[i];
    const prevPrice = HISTORICAL_PRICES_DATA[i - 1];

    if (wave1EndIndex === -1) {
      // asegurarse de tener al menos 5 precios antes del índice actual
      const wave5StartPrice = HISTORICAL_PRICES_DATA[i - 4];
      const wave5Prices = HISTORICAL_PRICES_DATA.slice(i - 4, i + 1);
      const isWave5 = isImpulseWave(wave5Prices);
      const isHigherThanWave5Start = currentPrice > wave5StartPrice;

      if (isWave5 && isHigherThanWave5Start) {
        wave5EndPrice = currentPrice;
      }
    } else {
      // buscar un punto de reversión en la dirección de la tendencia de la wave 1
      const variation = (currentPrice / prevPrice) * 100 - 100;

      const isReversal =
        (wave5EndPrice < HISTORICAL_PRICES_DATA[wave1EndIndex] &&
          variation < 0) ||
        (wave5EndPrice > HISTORICAL_PRICES_DATA[wave1EndIndex] &&
          variation > 0);

      if (isReversal) {
        wave1EndIndex = i - 1;
        break;
      }
    }

    if (wave1EndIndex === -1 && i <= 4) {
      wave1EndIndex = i;
    }
  }

  return wave1EndIndex;
}

function getWave2StartIndex(wave1EndIndex) {
  let wave2StartIndex = -1;

  for (let i = wave1EndIndex + 1; i < HISTORICAL_PRICES_DATA.length; i++) {
    const currentPrice = HISTORICAL_PRICES_DATA[i];
    const prevPrice = HISTORICAL_PRICES_DATA[i - 1];

    if (wave2StartIndex === -1) {
      // Look for a high point
      if (currentPrice > prevPrice) {
        wave2StartIndex = i;
      }
    } else {
      // Look for a low point
      if (currentPrice < prevPrice) {
        return i;
      }
    }
  }

  return wave2StartIndex;
}

function getWave3EndIndex(wave2StartIndex) {
  let wave3EndIndex = -1;
  let wave3EndPrice = 0;

  for (let i = wave2StartIndex + 1; i < HISTORICAL_PRICES_DATA.length; i++) {
    const currentPrice = HISTORICAL_PRICES_DATA[i];
    const prevPrice = HISTORICAL_PRICES_DATA[i - 1];

    if (wave3EndIndex === -1) {
      // look for a high point
      if (currentPrice > prevPrice) {
        wave3EndPrice = currentPrice;
      }
      // check for a trend reversal
      const variation = (currentPrice / prevPrice) * 100 - 100;
      const isReversal =
        wave3EndPrice > HISTORICAL_PRICES_DATA[wave2StartIndex] &&
        variation < -23.6;
      if (isReversal) {
        wave3EndIndex = i - 1;
      }
    }
  }

  return wave3EndIndex;
}

function getWave4EndIndex(wave3EndIndex) {
  let wave4EndIndex = -1;
  const wave3HighPrice = HISTORICAL_PRICES_DATA[wave3EndIndex];

  for (let i = wave3EndIndex + 1; i < HISTORICAL_PRICES_DATA.length; i++) {
    const currentPrice = HISTORICAL_PRICES_DATA[i];
    const prevPrice = HISTORICAL_PRICES_DATA[i - 1];

    // check if price is lower than wave 3 end price
    if (currentPrice < wave3HighPrice) {
      // look for a three-wave decline pattern
      if (i + 2 < HISTORICAL_PRICES_DATA.length) {
        const pricesToCheck = HISTORICAL_PRICES_DATA.slice(i, i + 3);
        const isThreeWaveDecline = isCorrectThreeWaveDecline(pricesToCheck);

        if (isThreeWaveDecline) {
          // look for a retracement of wave 3
          const wave3RetracementLevel = calculateWaveRetracementLevel(
            wave3HighPrice,
            prevPrice
          );
          const isRetracementBelow50 = currentPrice < wave3RetracementLevel;

          if (isRetracementBelow50) {
            wave4EndIndex = i + 2;
            break;
          }
        }
      }
    }
  }

  return wave4EndIndex;
}

function getWave5EndIndex(wave3EndIndex) {
  let wave5EndIndex = -1;
  let wave5EndPrice = 0;

  for (let i = wave3EndIndex + 1; i < HISTORICAL_PRICES_DATA.length; i++) {
    const currentPrice = HISTORICAL_PRICES_DATA[i];
    const prevPrice = HISTORICAL_PRICES_DATA[i - 1];

    // look for a high point
    if (currentPrice > prevPrice) {
      wave5EndPrice = currentPrice;
    } else {
      // look for a point of reversal in the direction of the trend of wave 3
      const variation = (currentPrice / prevPrice) * 100 - 100;
      const isReversal =
        (wave5EndPrice < HISTORICAL_PRICES_DATA[wave3EndIndex] &&
          variation < 0) ||
        (wave5EndPrice > HISTORICAL_PRICES_DATA[wave3EndIndex] &&
          variation > 0);

      if (isReversal) {
        wave5EndIndex = i - 1;
        break;
      }
    }
  }

  return wave5EndIndex;
}

function findFiveWavePattern() {
  const waves = [];

  let startIndex = 0;
  let waveNumber = 0;

  while (startIndex < HISTORICAL_PRICES_DATA.length) {
    waveNumber++;

    const wave1StartIndex = startIndex;
    const wave1EndIndex = calculateWave1EndIndex(
      HISTORICAL_PRICES_DATA.slice(startIndex)
    );
    const wave2StartIndex = getWave2StartIndex(startIndex + wave1EndIndex);
    const wave3EndIndex = getWave3EndIndex(startIndex + wave2StartIndex);
    const wave4EndIndex = getWave4EndIndex(
      startIndex + wave3EndIndex,
      MIN_WAVE_4_CORRECTION
    );
    const wave5EndIndex = getWave5EndIndex(startIndex + wave4EndIndex);

    if (
      wave1StartIndex < wave1EndIndex &&
      wave1EndIndex <= wave2StartIndex &&
      wave2StartIndex <= wave3EndIndex
    ) {
      console.log({
        wave1StartIndex,
        wave1EndIndex,
        wave2StartIndex,
        wave3EndIndex,
        // wave4EndIndex,
        // wave5EndIndex,
      });
    }

    const wave1Prices = HISTORICAL_PRICES_DATA.slice(
      startIndex + wave1StartIndex,
      startIndex + wave1EndIndex + 1
    );
    const wave2Prices = HISTORICAL_PRICES_DATA.slice(
      startIndex + wave2StartIndex,
      startIndex + wave3EndIndex + 1
    );
    const wave3Prices = HISTORICAL_PRICES_DATA.slice(
      startIndex + wave3EndIndex,
      startIndex + wave4EndIndex + 1
    );
    // const wave4Prices = HISTORICAL_PRICES_DATA.slice(
    //   startIndex + wave4EndIndex,
    //   startIndex + wave5EndIndex + 1
    // );
    // const wave5Prices = HISTORICAL_PRICES_DATA.slice(startIndex + wave5EndIndex);

    const isWave1Impulse = isImpulseWave(wave1Prices);
    const isWave2Corrective = isCorrectiveWave(
      wave2Prices,
      VARIATION_CORRECTIVE_WAVE
    );
    const isWave3Impulse = isImpulseWave(wave3Prices);
    // const isWave4Corrective = isCorrectiveWave(
    //   wave4Prices,
    //   VARIATION_CORRECTIVE_WAVE
    // );
    // const isWave5Impulse = isImpulseWave(wave5Prices);

    if (
      isWave1Impulse &&
      isWave2Corrective &&
      isWave3Impulse
      // isWave4Corrective &&
      // isWave5Impulse
    ) {
      waves.push({
        waveNumber,
        wave1Prices,
        wave2Prices,
        wave3Prices,
        // wave4Prices,
        // wave5Prices,
      });

      startIndex += wave5EndIndex + 1;
    } else {
      startIndex += 1;
    }
  }

  return waves;
}

function getFibonacci() {
  // const wave1Origins = getWave1Origins();
  // console.log({ wave1Origins });

  const result = findFiveWavePattern();
  console.log({ result });
}

module.exports = {
  getFibonacci,
};

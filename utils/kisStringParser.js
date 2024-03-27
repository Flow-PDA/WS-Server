/**
 * Price string to obj
 * @param {*} cnt
 * @param {*} msg
 * @returns [code, 체결가, 전일대비부호, 전일대비, 전일대비율, 주식시가, 시가대비구분, 시가대비]
 */
function priceArrConverter(cnt, msg) {
  const ret = [];
  for (let i = 0; i < cnt; i++) {
    const priceArr = msg.split("^");
    // stock code, price, sign against prev. day, diff, diff rate, sign against start, diff
    ret.push([
      priceArr[46 * i],
      priceArr[46 * i + 2],
      priceArr[46 * i + 3],
      priceArr[46 * i + 4],
      priceArr[46 * i + 5],
      priceArr[46 * i + 7],
      priceArr[46 * i + 25],
      priceArr[46 * i + 26],
    ]);
  }

  return ret;
}

/**
 * Buy-Sell string to obj
 * @param {Number} type
 * @param {String} msg array of received message from KIS WS divided by '|'
 * @returns {Object} { code: stock_code, sellList: [10][2], buyList: [10][2] }
 */
function buySellConverter(msg) {
  // console.log(`[SUB] RECEIVED DATA : ${msg}`);

  // console.log(msg);
  const dataArr = msg.split("^");

  const stockCode = dataArr[0];
  const sellList = [];
  const buyList = [];
  for (let i = 0; i < 10; i++) {
    sellList[i] = [dataArr[12 - i], dataArr[12 - i + 20]];
    buyList[i] = [dataArr[i + 13], dataArr[i + 13 + 20]];
  }

  return { code: stockCode, sellList, buyList };
}

module.exports = { priceArrConverter, buySellConverter };

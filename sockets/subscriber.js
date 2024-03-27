const Websocket = require("ws");
const EventEmitter = require("events");
// const { updateData } = require("./subscribeManajer");
const { filterUnicode } = require("../utils/kisEncoderjs");
const wsUrl = process.env.KIS_WS_URL;
let ws = null;

const approvalKey = process.env.KIS_WS_APPROVAL_KEY;

/**
 * Convert type(number) to TR_ID
 * type might be 0(nth), 1(H0STCNT0), 2(H0STASP0)
 */
const TYPE_TO_TR_ID = ["", "H0STCNT0", "H0STASP0"];

console.log("init sub");

class SubscriberEmitter extends EventEmitter {}
const subscriberEmitter = new SubscriberEmitter();

/**
 * init WS
 */
module.exports = () => {
  ws = new Websocket(wsUrl);
  ws.on("open", () => {
    console.log(`Connected to ${wsUrl}`);
    // const code = "005930";
    // const temp = `{"header":{"approval_key": "${approvalKey}","custtype":"P","tr_type":"1","content-type":"utf-8"},"body":{"input":{"tr_id":"H0STCNT0","tr_key":"${code}"}}}`;
    // console.log(temp);
    // ws.send(temp);
  });

  ws.on("message", (data) => {
    // console.log(data);
    const recvdata = filterUnicode(data).toString("utf8");
    // console.log(recvdata.toString("utf8"));

    console.log(`[SUB] received : ${recvdata}`);
    const dataArr = recvdata.split("|");
    // console.log(dataArr[3]);
    // console.log(dataArr);

    // subscriberEmitter.emit("MESSAGE", "ping");
    if (dataArr[1] == "H0STCNT0") {
      // 체결가
      const res = priceArrConverter(dataArr[2], dataArr[3]);

      res.forEach((elem) => {
        subscriberEmitter.emit("UPDATED", 1, elem[0], elem);
      });
    } else if (dataArr[1] == "H0STASP0") {
      // 호가
      const res = buySellConverter(2, dataArr[3]);
      // console.log(`[SUB] calls : ${recvdata}`);

      subscriberEmitter.emit("UPDATED", 2, res.code, res);
      // console.log(res);
    } else {
      // others
      const obj = JSON.parse(recvdata);

      if (obj.header?.tr_id === "PINGPONG") {
        // PING
        console.log(`[SUB] received pingpong at ${obj.header.datetime}`);
        ws.pong(recvdata);
        console.log(`[SUB] send heartbeat signal`);
      } else {
        console.log(`[SUB] ERROR : ${recvdata}`);
      }
    }
  });
};

/**
 * send subscription message to KIS WS
 * @param {*} type 1(체결가) 2(호가)
 * @param {*} code target stock code
 */
module.exports.subscribe = (type, code) => {
  console.log(`[SUB] start subscribing ${code}`);
  const temp = `{"header":{"approval_key": "${approvalKey}","custtype":"P","tr_type":"1","content-type":"utf-8"},"body":{"input":{"tr_id":"${TYPE_TO_TR_ID[type]}","tr_key":"${code}"}}}`;
  console.log(`[SUB] send messgage : ${temp}`);
  ws.send(temp);
};

/**
 * send unsubscription message to KIS WS
 * @param {*} type 1(체결가) 2(호가)
 * @param {*} code target stock code
 */
module.exports.remove = (type, code) => {
  console.log(`[SUB] stop subscribing ${code}`);
  const temp = `{"header":{"approval_key": "${approvalKey}","custtype":"P","tr_type":"2","content-type":"utf-8"},"body":{"input":{"tr_id":"${TYPE_TO_TR_ID[type]}","tr_key":"${code}"}}}`;
  console.log(`[SUB] send messgage : ${temp}`);
  ws.send(temp);
};

module.exports.subscriberEmitter = subscriberEmitter;

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

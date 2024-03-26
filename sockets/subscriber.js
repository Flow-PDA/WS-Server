const Websocket = require("ws");
const EventEmitter = require("events");
// const { updateData } = require("./subscribeManajer");
const { filterUnicode } = require("../utils/kisEncoderjs");
const wsUrl = process.env.KIS_WS_URL;
let ws = null;

const approvalKey = process.env.KIS_APPROVAL_KEY;

console.log("init sub");

class SubscriberEmitter extends EventEmitter {}
const subscriberEmitter = new SubscriberEmitter();

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

    console.log(recvdata);
    const dataArr = recvdata.split("|");
    // console.log(dataArr[3]);
    // console.log(dataArr);

    subscriberEmitter.emit("MESSAGE", "ping");
    if (dataArr[1] == "H0STCNT0") {
      const dataCnt = Number(dataArr[2]);
      for (let i = 0; i < dataCnt; i++) {
        const priceArr = dataArr[3].split("^");
        // console.log(priceArr.length);
        console.log(priceArr[46 * i], priceArr[46 * i + 2]);

        console.log("[SUB] new data : EMIT");
        subscriberEmitter.emit("MESSAGE", {
          code: priceArr[46 * i],
          price: priceArr[46 * i + 2],
        });
      }
    }
  });
};

module.exports.subscribe = () => {
  const code = "005930";
  console.log(`start subscribing ${code}`);
  const temp = `{"header":{"approval_key": "${approvalKey}","custtype":"P","tr_type":"1","content-type":"utf-8"},"body":{"input":{"tr_id":"H0STCNT0","tr_key":"${code}"}}}`;
  console.log(temp);
  ws.send(temp);
};

module.exports.remove = () => {
  const code = "005930";
  console.log(`stop subscribing ${code}`);
  const temp = `{"header":{"approval_key": "${approvalKey}","custtype":"P","tr_type":"2","content-type":"utf-8"},"body":{"input":{"tr_id":"H0STCNT0","tr_key":"${code}"}}}`;
  console.log(temp);
  ws.send(temp);
};

module.exports.subscriberEmitter = subscriberEmitter;

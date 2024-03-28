const Websocket = require("ws");
// const { updateData } = require("./subscribeManajer");
const { filterUnicode } = require("../utils/kisEncoder.js");
const {
  priceArrConverter,
  buySellConverter,
} = require("../utils/kisStringParser");

/**
 * Convert type(number) to TR_ID
 * type might be 0(nth), 1(H0STCNT0), 2(H0STASP0)
 */
const TYPE_TO_TR_ID = ["", "H0STCNT0", "H0STASP0"];

const wsUrl = process.env.KIS_WS_URL;

class SubscriberClass {
  constructor(approvalKey, idx, subscriberEmitter) {
    console.log(`[WS] init ${idx}-th sub`);
    this.idx = idx;
    this.approvalKey = approvalKey;
    this.subCnt = 0;
    this.subscriberEmitter = subscriberEmitter;
    this.ws = new Websocket(wsUrl);
    this.ws.on("open", () => {
      console.log(`[WS] ${idx} Connected to ${wsUrl}`);
    });
    this.ws.on("message", (data) => {
      // console.log(data);
      const recvdata = filterUnicode(data).toString("utf8");
      // console.log(recvdata.toString("utf8"));

      // console.log(`[SUB] received : ${recvdata}`);
      const dataArr = recvdata.split("|");
      // console.log(dataArr[3]);
      // console.log(dataArr);

      // subscriberEmitter.emit("MESSAGE", "ping");
      if (dataArr[1] == "H0STCNT0") {
        // 체결가
        const res = priceArrConverter(dataArr[2], dataArr[3]);

        res.forEach((elem) => {
          this.subscriberEmitter.emit("UPDATED", 1, elem[0], elem);
        });
      } else if (dataArr[1] == "H0STASP0") {
        // 호가
        // console.log(dataArr[3]);
        const res = buySellConverter(dataArr[3]);
        // console.log(`[SUB] calls : ${recvdata}`);

        this.subscriberEmitter.emit("UPDATED", 2, res.code, res);
        // console.log(res);
      } else {
        // others
        const obj = JSON.parse(recvdata);

        if (obj.header?.tr_id === "PINGPONG") {
          // PING
          console.log(`[SUB] received pingpong at ${obj.header.datetime}`);
          this.ws.pong(recvdata);
          console.log(`[SUB] send heartbeat signal`);
        } else {
          console.log(`[SUB] ERROR : ${recvdata}`);
        }
      }
    });
  }

  /**
   * send subscription message to KIS WS
   * @param {*} type 1(체결가) 2(호가)
   * @param {*} code target stock code
   */
  subscribe(type, code) {
    this.subCnt++;
    console.log(
      `[SUB-${this.idx}] start subscribing ${code} : ${this.subCnt} subscribing}`
    );
    const temp = `{"header":{"approval_key": "${this.approvalKey}","custtype":"P","tr_type":"1","content-type":"utf-8"},"body":{"input":{"tr_id":"${TYPE_TO_TR_ID[type]}","tr_key":"${code}"}}}`;
    console.log(`[SUB] send messgage : ${temp}`);
    this.ws.send(temp);
  }
  /**
   * send unsubscription message to KIS WS
   * @param {*} type 1(체결가) 2(호가)
   * @param {*} code target stock code
   */
  remove(type, code) {
    this.subCnt--;
    console.log(`[SUB] stop subscribing ${code} : ${this.subCnt} subscribing`);
    const temp = `{"header":{"approval_key": "${this.approvalKey}","custtype":"P","tr_type":"2","content-type":"utf-8"},"body":{"input":{"tr_id":"${TYPE_TO_TR_ID[type]}","tr_key":"${code}"}}}`;
    console.log(`[SUB] send messgage : ${temp}`);
    this.ws.send(temp);
  }
}

module.exports = SubscriberClass;

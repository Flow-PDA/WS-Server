// const { remove, subscribe } = require("./subscriber");
const { publish, publisherEmitter } = require("./publisher");
const EventEmitter = require("events");
const SubscriberClass = require("./SubscriberClass");
const { getPrice, getCallBids } = require("../apis/kisApi");

console.log("init manager");
const APPROVAL_KEYS = process.env.KIS_WS_APPROVAL_KEYS;
const approvalKeys = APPROVAL_KEYS?.split("|");
const availableWsCnt = approvalKeys.length;
const stockList = new Map();
const wsList = new Array(availableWsCnt);

class SubscriberEmitter extends EventEmitter { }
const subscriberEmitter = new SubscriberEmitter();

// Receive list of tasks
publisherEmitter.on("REGISTER_SUB", (msg) => {
  console.log(`[PUB]Event : REGISTER_SUB : ${msg.length}`);
  msg.forEach((elem) => {
    addStock(elem.type, elem.code);
  });
});

// Receive list of task to remove
publisherEmitter.on("RELEASE_SUB", (msg) => {
  console.log(`[PUB]Event : RELEASE_SUB : ${msg.length}`);
  msg.forEach((elem) => {
    decreaseStock(elem.type, elem.code);
  });
});

// TODO: Handle message from KIS WS
subscriberEmitter.on("MESSAGE", (data) => {
  // const taskId = `${type}-${code}`;
  console.log(`[SUB]Event : MESSAGE : ${data}`);
  // updateData(taskId, data);
});

// Handle received data from KIS WS
subscriberEmitter.on("UPDATED", (type, code, payload) => {
  const taskId = `${type}-${code}`;
  // console.log(`[SUB]Event : UPDATED : ${taskId}`);

  const elem = stockList.get(taskId);
  if (elem) {
    elem.data = payload;

    stockList.set(taskId, elem);
    updateData(taskId, payload);
  }
});

createWS(0);

createWS(1);

/**
 * handle new subscription event from client
 * @param {*} type
 * @param {*} stockCode
 */
function addStock(type, stockCode) {
  const taskId = `${type}-${stockCode}`;
  const elem = stockList.get(taskId);
  console.log(
    `[MAN] sub event from client : ${type}-${stockCode} : ${elem} exists`
  );
  // console.log(elem);
  if (!elem || elem.cnt == 0 || elem.data) {
    console.log(`[MAN] ${taskId} not exists, CREATE NEW`);

    let initialData = [];
    const wsIdx = subscribe(type, stockCode);
    if (type == 1) {
      getPrice(stockCode).then((data) => {
        // console.log(data);
        stockList.set(taskId, { cnt: 1, data: initialData, wsIdx: wsIdx });
        console.log(
          `[MAN] ${taskId} data created at ws ${wsIdx}, ${stockList.size} subscription elem exists`
        );
        updateData(taskId, data);
      });
    } else if (type == 2) {
      getCallBids(stockCode).then((data) => {
        // console.log(data);
        stockList.set(taskId, { cnt: 1, data: initialData, wsIdx: wsIdx });
        console.log(
          `[MAN] ${taskId} data created at ws ${wsIdx}, ${stockList.size} subscription elem exists`
        );
        updateData(taskId, data);
      });
    }
  } else {
    console.log(`[MAN] ${taskId} exists, ${elem.cnt}, send ${elem.data}`);
    stockList.set(taskId, { ...elem, cnt: elem.cnt + 1 });
    updateData(taskId, elem.data);
  }
}

/**
 * hanlde unsubscription event from client
 * @param {*} type
 * @param {*} stockCode
 */
function decreaseStock(type, stockCode) {
  const taskId = `${type}-${stockCode}`;
  const elem = stockList.get(taskId);
  console.log(`[MAN] release event from client : decrease ${taskId}`);
  // console.log(elem);
  if (!elem || elem.cnt == 1) {
    console.log(`[MAN] ${taskId} not exist or to be removed`);
    stockList.delete(taskId);

    if (elem) {
      remove(type, stockCode, elem.wsIdx);
    }
  } else {
    console.log(
      `[MAN] ${taskId} exists with ${elem.cnt - 1} still subscribing`
    );
    stockList.set(taskId, { ...elem, cnt: elem.cnt - 1 });
  }
}

/**
 * update data
 * @param {*} taskId
 * @param {*} data
 */
function updateData(taskId, data) {
  // console.log(taskId);
  // console.log(data);
  publish(taskId, data);
}
/**
 * Create websocket connection by index number
 * @param {*} idx ws index
 */
function createWS(idx) {
  const subscriber = new SubscriberClass(
    approvalKeys[idx],
    idx,
    subscriberEmitter
  );
  wsList[idx] = { cnt: 0, instance: subscriber };
}

/**
 * Create subscription
 * @param {*} type tr_type
 * @param {*} stockCode stock code
 * @returns
 */
function subscribe(type, stockCode) {
  const wsIdx = findAvailableWsIdx();
  if (wsIdx === -1) {
    // TODO : do sth
    return;
  }

  wsList[wsIdx].instance.subscribe(type, stockCode);
  wsList[wsIdx].cnt++;
  return wsIdx;
}

/**
 * Remove subscription
 * @param {*} type tr_type
 * @param {*} stockCode stock code
 * @param {*} wsIdx wesocket index
 */
function remove(type, stockCode, wsIdx) {
  wsList[wsIdx].instance.remove(type, stockCode);
  wsList[wsIdx].cnt--;
  // disconnect if 0
}

/**
 * Find available Websocket index
 * @returns index number, -1 if no WS available
 */
function findAvailableWsIdx() {
  for (let i = 0; i < availableWsCnt; i++) {
    if (wsList[i].cnt < 40) return i;
  }
  return -1;
}

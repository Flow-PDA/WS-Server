const { remove, subscribe, subscriberEmitter } = require("./subscriber");
const { publish, publisherEmitter } = require("./publisher");
const { getPrice } = require("../apis/kisApi");

console.log("init manager");
const stockList = new Map();

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
  console.log(`[SUB]Event : UPDATED : ${taskId}`);

  const elem = stockList.get(taskId);
  if (elem) {
    elem.data = payload;

    stockList.set(taskId, elem);
    updateData(taskId, payload);
  }
});

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
  if (!elem || elem.cnt == 0) {
    console.log(`[MAN] ${taskId} not exists, CREATE NEW`);

    let initialData = [];
    if (type == 1) {
      getPrice(stockCode).then((data) => {
        // console.log(data);
        initialData = data;
        updateData(taskId, data);
      });
    }
    stockList.set(taskId, { cnt: 1, data: initialData });
    subscribe(type, stockCode);
    console.log(
      `[MAN] ${taskId} data created, ${stockList.size} subscription elem exists`
    );
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
    remove(type, stockCode);
  } else {
    console.log(`[MAN] ${taskId} exists with ${elem.cnt} still subscribing`);
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

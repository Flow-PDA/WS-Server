const stockList = new Map();
const { remove, subscribe, subscriberEmitter } = require("./subscriber");
const { publish, publisherEmitter } = require("./publisher");

console.log("init manager");

/**
 * Receive list of tasks
 */
publisherEmitter.on("REGISTER_SUB", (msg) => {
  console.log(`[PUB]Event : REGISTER_SUB : ${msg.length}`);
  msg.forEach((elem) => {
    addStock(elem.type, elem.code);
  });
});

publisherEmitter.on("RELEASE_SUB", (msg) => {
  console.log(`[PUB]Event : RELEASE_SUB : ${msg.length}`);
  msg.forEach((elem) => {
    decreaseStock(elem.type, elem.code);
  });
});

subscriberEmitter.on("MESSAGE", (data) => {
  // const taskId = `${type}-${code}`;
  console.log(`[SUB]Event : MESSAGE : ${data}`);
  // updateData(taskId, data);
});

subscriberEmitter.on("UPDATED", (type, code, payload) => {
  const taskId = `${type}-${code}`;
  console.log(`[SUB]Event : UPDATED : ${taskId}`);
  updateData(taskId, payload);
});

function addStock(type, stockCode) {
  const taskId = `${type}-${stockCode}`;
  const elem = stockList.get(taskId);
  console.log(
    `[MAN] sub event from client : ${type}-${stockCode} : ${elem} exists`
  );
  // console.log(elem);
  if (!elem || elem.cnt == 0) {
    console.log(`[MAN] ${taskId} not exists, CREATE NEW`);
    stockList.set(taskId, { cnt: 1, data: {} });
    subscribe(type, stockCode);
  } else {
    console.log(`[MAN] ${taskId} exists, ${elem.cnt}`);
    stockList.set(taskId, { ...elem, cnt: elem.cnt + 1 });
  }
}

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

function updateData(taskId, data) {
  // console.log(taskId);
  // console.log(data);
  publish(taskId, data);
}

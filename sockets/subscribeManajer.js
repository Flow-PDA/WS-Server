const stockList = new Map();
const { remove, subscribe, subscriberEmitter } = require("./subscriber");
const { publish, publisherEmitter } = require("./publisher");

console.log("init manager");

publisherEmitter.on("REGISTER_SUB", (msg) => {
  console.log(`[PUB]Event : REGISTER_SUB : ${msg}`);
  addStock("005930", msg);
});

publisherEmitter.on("RELEASE_SUB", (msg) => {
  console.log(`[PUB]Event : RELEASE_SUB : ${msg}`);
  decreaseStock("005930");
});

subscriberEmitter.on("MESSAGE", (msg) => {
  console.log(`[SUB]Event : MESSAGE : ${msg}`);
  updateData("005930", msg);
});

function addStock(stockCode, msg) {
  const elem = stockList.get(stockCode);
  console.log(elem);
  if (!elem || elem.cnt == 0) {
    stockList.set(stockCode, { cnt: 1, data: {} });
    subscribe();
  } else {
    stockList.set(stockCode, { ...elem, cnt: elem.cnt + 1 });
  }
}

function decreaseStock(stockCode) {
  const elem = stockList.get(stockCode);
  console.log(elem);
  if (!elem || elem.cnt == 1) {
    stockList.delete(stockCode);
    remove();
  } else {
    stockList.set(stockCode, { ...elem, cnt: elem.cnt - 1 });
  }
}

function updateData(code, data) {
  console.log(data);
  publish("005930", data);
}

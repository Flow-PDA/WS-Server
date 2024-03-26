const SocketIO = require("socket.io");
const EventEmitter = require("events");
// const { addStock, decreaseStock } = require("./subscribeManajer");

let socketIo = null;
const sockets = [];
class PublisherEmitter extends EventEmitter {}
const publisherEmitter = new PublisherEmitter();

console.log("init pub");

/**
 * init socket io
 * @param {*} server http server
 */
module.exports = (server) => {
  socketIo = SocketIO(server, {
    path: "/socket.io",
    cors: { origin: "*" },
  });

  // when client connected
  socketIo.on("connection", (socket) => {
    console.log(`client connected : ${socket.id}`);
    // sockets.push(socket);

    // add event listeners
    // register
    socket.on("REGISTER_SUB", (msg) => {
      console.log(msg);
      // const roomId = "005930";
      console.log(`[${socket.id}]JOINED ROOM : ${roomId}`);
      socket.join(roomId);
      console.log(`[${socket.id}] room list : ${socket.rooms}`);

      // emit event to manager
      publisherEmitter.emit("REGISTER_SUB", msg);

      // registered
      socketIo.emit("msg", "ok");
    });

    // release
    socket.on("RELEASE_SUB", (msg) => {
      console.log(msg);
      // decreaseStock(msg);
      const roomId = "005930";
      console.log(`[${socket.id}]LEAVE ROOM : ${roomId}`);
      socket.leave(roomId);
      console.log(`[${socket.id}] room list : ${socket.rooms}`);
    });

    socket.on("disconnecting", () => {
      console.log(`[${socket.id}] disconnects`);
      const roomList = socket.rooms;
      console.log(`[${socket.id}] current room list : ${roomList}`);
      for (let i = 0; i < roomList.length; i++) {
        socket.leave(roomList[i]);
      }

      console.log(`[${socket.id}] rooms left : ${socket.rooms}`);
      publisherEmitter.emit("RELEASE_SUB", socket.romms);
    });
  });
};

/**
 * Publish data to clients
 * @param {*} stockCode
 * @param {*} data
 */
module.exports.publish = (stockCode, data) => {
  console.log(`Publish to ${stockCode} : ${data.price}`);
  socketIo.to(stockCode).emit("update", "hi there!");
};

module.exports.publisherEmitter = publisherEmitter;

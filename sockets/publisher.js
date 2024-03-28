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
      const taskList = splitMessage(msg);

      taskList.forEach((elem) => {
        const roomId = `${elem.type}-${elem.code}`;
        socket.join(roomId);
        console.log(`[${socket.id}]JOINED ROOM : ${roomId}`);
      });
      console.log(`[${socket.id}] room list : ${[...socket.rooms].join(", ")}`);

      // emit event to manager
      publisherEmitter.emit("REGISTER_SUB", taskList);

      // registered
      socketIo.emit("msg", "Connected");
    });

    // release
    socket.on("RELEASE_SUB", (msg) => {
      // console.log(msg);
      const taskList = splitMessage(msg);

      taskList.forEach((elem) => {
        const roomId = `${elem.type}-${elem.code}`;
        console.log(`[${socket.id}]LEAVE ROOM : ${roomId}`);
        socket.leave(roomId);
      });
      console.log(`[${socket.id}] room list : ${[...socket.rooms].join(", ")}`);

      publisherEmitter.emit("RELEASE_SUB", taskList);
    });

    socket.on("disconnecting", () => {
      console.log(`[${socket.id}] disconnects`);
      const roomList = socket.rooms;
      console.log(`[${socket.id}] current room list : ${roomList}`);
      for (let i = 0; i < roomList.length; i++) {
        socket.leave(roomList[i]);
      }

      console.log(
        `[${socket.id}] rooms left : ${[...socket.rooms].join(", ")}`
      );

      const taskList = [];
      roomList.forEach((elem) => {
        const data = elem.split("-");
        // except default room
        if (data.length === 2) {
          taskList.push({ type: data[0], code: data[1] });
        }
      });
      publisherEmitter.emit("RELEASE_SUB", taskList);
    });
  });
};

/**
 * Publish data to clients
 * @param {*} stockCode
 * @param {*} data
 */
module.exports.publish = (roomId, data) => {
  console.log(`[PUB] Publish to ${roomId} : ${data}`);
  socketIo.to(roomId).emit("update", data);
};

module.exports.publisherEmitter = publisherEmitter;

/**
 * Split message sent from client
 * @param {String} msg
 * @returns {Array} list of { type, data }
 */
function splitMessage(msg) {
  const dataArr = msg.split("^");
  const ret = dataArr.map((elem) => {
    const data = elem.split("|");
    return { type: data[0], code: data[1] };
  });

  return ret;
}

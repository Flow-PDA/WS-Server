const axios = require("axios");
const { refreshToken } = require("../utils/tokenRefresher");

const APP_KEY = process.env.KIS_API_APP_KEY;
const APP_SECRET = process.env.KIS_API_APP_SECRET;
const ACCESS_TOKEN = process.env.KIS_API_ACCESS_TOKEN;
const INIT_AT_STARTUP = process.env.INIT_AT_STARTUP || "";

console.log(ACCESS_TOKEN);

const BASE_URL = process.env.KIS_API_BASE_URL;
const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "content-type": "application/json",
    authorization: `Bearer ${ACCESS_TOKEN}`,
    appkey: APP_KEY,
    appsecret: APP_SECRET,
    tr_id: "FHKST01010100",
  },
});

/**
 * Init at App startup
 */
const initToken = async () => {
  const token = await refreshToken(APP_KEY, APP_SECRET);
  console.log(`KIS API axios instance initiated with token : ${token}`);
  instance.interceptors.request.use(function (request) {
    request.headers.authorization = `Bearer ${token}`;

    return request;
  });
};

// Refresh TOKEN at startup
if (INIT_AT_STARTUP == "INIT") {
  initToken();
}

/**
 * update token of authorized axios instance
 * @param {*} token
 */
const updateToken = (token) => {
  instance.interceptors.request.use(function (request) {
    request.headers.authorization = `Bearer ${token}`;

    return request;
  });
};

module.exports = { instance, updateToken };

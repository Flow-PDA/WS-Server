const axios = require("axios");

const APP_KEY = process.env.KIS_API_APP_KEY;
const APP_SECRET = process.env.KIS_API_APP_SECRET;
const ACCESS_TOKEN = process.env.KIS_API_ACCESS_TOKEN;

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

module.exports.instance = instance;

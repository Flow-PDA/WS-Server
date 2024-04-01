const axios = require("axios");

const AUTH_API_URL = process.env.KIS_API_AUTH_URL;

async function refreshToken(appKey, appSecret) {
  let data = JSON.stringify({
    grant_type: "client_credentials",
    appkey: `${appKey}`,
    appsecret: `${appSecret}`,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${AUTH_API_URL}/oauth2/tokenP`,
    headers: {
      "content-type": "application/json",
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    // console.log(JSON.stringify(response.data));
    console.log(`KIS API token refreshed : ${response.data.access_token}`);
    return response.data.access_token;
  } catch (error) {
    return "";
  }
}

module.exports.refreshToken = refreshToken;

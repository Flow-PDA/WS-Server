const CryptoJS = require("crypto-js");

// async function getApproval(key, secret) {
//   const url = process.env.KIS_WS_AUTH_URL;
//   const headers = { "content-type": "application/json" };
//   const body = {
//     grant_type: "client_credentials",
//     appkey: key,
//     secretkey: secret,
//   };

//   const res = axios.post(url, body, { headers: headers });
//   const approval_key = res.json()["approval_key"];
//   return approval_key;
// }

var escapable =
  /[\x00-\x1f\ud800-\udfff\u200c\u2028-\u202f\u2060-\u206f\ufff0-\uffff]/g;

function filterUnicode(quoted) {
  escapable.lastIndex = 0;
  if (!escapable.test(quoted)) return quoted;

  return quoted.replace(escapable, function (a) {
    return "";
  });
}

/** start of aes256Decode function **********************/
function aes256Decode(secretKey, Iv, data) {
  console.log("");
  console.log("[aes256Decode] : [start]");
  console.log("[Key]  : " + secretKey);
  console.log("[Iv]   : " + Iv);
  console.log("[Data] : " + data);

  const cipher = CryptoJS.AES.decrypt(
    data,
    CryptoJS.enc.Utf8.parse(secretKey),
    {
      iv: CryptoJS.enc.Utf8.parse(Iv),
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    }
  );

  const aes256DecodeData = cipher.toString(CryptoJS.enc.Utf8);
  console.log("[aes256Decode] : [decode]");
  console.log("[data] : " + aes256DecodeData);
  console.log("");
  return aes256DecodeData;
}

module.exports = { filterUnicode, aes256Decode };

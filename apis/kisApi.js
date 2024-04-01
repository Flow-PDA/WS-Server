const { response } = require("../app");
const { instance } = require("./kisApiInstance");

/**
 *
 * @param {*} stockCode
 * @returns
 */
async function getPrice(stockCode) {
  try {
    console.log(stockCode);
    const resp = await instance.get(
      `uapi/domestic-stock/v1/quotations/inquire-price?fid_cond_mrkt_div_code=J&fid_input_iscd=${stockCode}`,
      {
        headers: {
          tr_id: "FHKST01010100",
        },
      }
    );

    const output = resp.data.output;
    // console.log(resp);
    console.log(
      `[API] ${stockCode} : current : ${response.data.output["stck_prpr"]}`
    );

    return [
      stockCode,
      output["stck_prpr"],
      output["prdy_vrss_sign"],
      output["prdy_vrss"],
      output["prdy_ctrt"],
      output["stck_oprc"],
      0,
      0,
    ];
  } catch (error) {
    console.log(`[API] ${error.response?.data?.msg1}`);
    // console.log(error);
  }
}

async function getCallBids(stockCode) {
  try {
    console.log(stockCode);
    const resp = await instance.get(
      `uapi/domestic-stock/v1/quotations/inquire-asking-price-exp-ccn?fid_cond_mrkt_div_code=J&fid_input_iscd=${stockCode}`,
      {
        headers: {
          tr_id: "FHKST01010200",
        },
      }
    );

    console.log(`[API] ${stockCode} : max price : ${resp.data.output1.askp1}`);
    const output = resp.data.output1;

    const sellList = [];
    const buyList = [];
    for (let i = 1; i < 11; i++) {
      sellList.push([output[`askp${i}`], output[`askp_rsqn${i}`]]);
      buyList.push([output[`bidp${i}`], output[`bidp_rsqn${i}`]]);
    }

    return {
      code: stockCode,
      sellList,
      buyList,
    };
  } catch (error) {}
}

module.exports = { getPrice, getCallBids };

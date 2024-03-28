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
      `uapi/domestic-stock/v1/quotations/inquire-price?fid_cond_mrkt_div_code=J&fid_input_iscd=${stockCode}`
    );

    const output = resp.data.output;
    // console.log(resp);

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

module.exports = { getPrice };

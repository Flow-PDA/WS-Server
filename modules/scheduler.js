const schedule = require("node-schedule");
const kisApiInstance = require("../apis/kisApiInstance");
const { refreshToken } = require("../utils/tokenRefresher");

const APP_KEY = process.env.KIS_API_APP_KEY;
const APP_SECRET = process.env.KIS_API_APP_SECRET;

const CRON_PER_12H = "0 */12 * * *";
const CRON_PER_2M = "*/2 * * * *";
const CRON_SCHEDULE = "00 23 * * *";

/**
 * shceduled job : refresh tokens of Party per 12H
 */
const resfreshTokens = schedule.scheduleJob(CRON_SCHEDULE, async function () {
  console.log("shceduler");

  // App's API Token
  const appToken = await refreshToken(APP_KEY, APP_SECRET);
  console.log(`Update App KIS token ${appToken}`);
  kisApiInstance.updateToken(appToken);
});

const express = require("express");
const {
  getStoreGames,
  getTotalRevenue,
  getDataByWeek,
  getDataByMonth,
  getTopCustomers,
  getTopGamesPerStore,
} = require("../controller/dashboardController");

const router = express.Router();
//enter

router.get("/getall-store", getStoreGames);

router.get("/get-total-revenue", getTotalRevenue);

router.get("/getdata-by-week", getDataByWeek);

router.get("/getdata-by-month", getDataByMonth);

router.get("/get-top-customers", getTopCustomers);

router.get("/get-top-games", getTopGamesPerStore);

module.exports = router;

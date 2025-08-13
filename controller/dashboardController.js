const Store = require("../models/Store");
const Customer = require("../models/customer");

// 📊 Get all stores with their screens and games
const getStoreGames = async (req, res) => {
  try {
    const stores = await Store.find();

    // Defensive check for no data
    if (!stores || stores.length === 0) {
      return res.status(404).json({ error: "No Store Found" });
    }

    // Map store data to include screen count and basic info
    const storeSummaries = stores.map((store) => ({
      id: store._id,
      name: store.name,
      number: store.number,
      address: store.address,
      screenCount: store?.screens?.length || 0,
      totalGames: store?.screens?.reduce((acc, screen) => {
        return acc + (screen?.games?.length || 0);
      }, 0),
    }));

    return res.status(200).json(storeSummaries);
  } catch (error) {
    console.error("Error in getStoreGames:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// 📊 Get aggregated booking data for charts, grouped by store
const getTotalRevenue = async (req, res) => {
  try {
    const bookings = await Customer.find(
      {},
      {
        store: 1,
        total_amount: 1,
        extended_amount: 1,
        extraSnacksPrice: 1,
        created_at: 1,
        _id: 0,
      }
    );

    const storeData = {};

    bookings.forEach((b) => {
      const store = b.store;
      if (!storeData[store]) {
        storeData[store] = {
          store,
          total_amount: 0,
          extended_amount: 0,
          extraSnacksPrice: 0,
          latest_created_at: b.created_at, // ✅ Initial date,
          bookings: 0, // optional: add count if needed
        };
      }

      storeData[store].total_amount += b.total_amount || 0;
      storeData[store].extended_amount += b.extended_amount || 0;
      storeData[store].extraSnacksPrice += b.extraSnacksPrice || 0;
      storeData[store].bookings += 1;

      // ✅ Add this block here (after totals update)
      if (
        b.created_at &&
        (!storeData[store].latest_created_at ||
          new Date(b.created_at) > new Date(storeData[store].latest_created_at))
      ) {
        storeData[store].latest_created_at = b.created_at;
      }
    });

    const result = Object.values(storeData);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAllStoreChartData:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// 📊 Get booking data for the current week, grouped by day
const getDataByWeek = async (req, res) => {
  try {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Calculate this week's Monday to Sunday date range
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Fetch all bookings within the week
    const bookings = await Customer.find({
      created_at: {
        $gte: monday,
        $lte: sunday,
      },
    });

    const storeWiseWeeklyData = {};

    bookings.forEach((booking) => {
      const {
        store,
        created_at,
        total_amount,
        extended_amount,
        extraSnacksPrice,
      } = booking;
      const dayName = dayNames[new Date(created_at).getDay()];

      // Initialize store if not already
      if (!storeWiseWeeklyData[store]) {
        storeWiseWeeklyData[store] = {
          store,
        };

        dayNames.forEach((day) => {
          storeWiseWeeklyData[store][day] = {
            total_amount: 0,
            extended_amount: 0,
            extraSnacksPrice: 0,
          };
        });
      }

      // Accumulate totals for the correct day
      storeWiseWeeklyData[store][dayName].total_amount += total_amount || 0;
      storeWiseWeeklyData[store][dayName].extended_amount +=
        extended_amount || 0;
      storeWiseWeeklyData[store][dayName].extraSnacksPrice +=
        extraSnacksPrice || 0;
    });

    res.status(200).json(Object.values(storeWiseWeeklyData));
  } catch (error) {
    console.error("Error in getDataByWeek:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getDataByMonth = async (req, res) => {
  try {
    const now = new Date();

    // Start and end of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // Get bookings from current month
    const bookings = await Customer.find({
      created_at: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    const storeWiseMonthlyData = {};

    bookings.forEach((booking) => {
      const {
        store,
        created_at,
        total_amount,
        extended_amount,
        extraSnacksPrice,
      } = booking;
      const dateKey = new Date(created_at).toISOString().split("T")[0]; // "YYYY-MM-DD"

      // Init store group if not exists
      if (!storeWiseMonthlyData[store]) {
        storeWiseMonthlyData[store] = {};
      }

      // Init date within store if not exists
      if (!storeWiseMonthlyData[store][dateKey]) {
        storeWiseMonthlyData[store][dateKey] = {
          total_amount: 0,
          extended_amount: 0,
          extraSnacksPrice: 0,
        };
      }

      storeWiseMonthlyData[store][dateKey].total_amount += total_amount || 0;
      storeWiseMonthlyData[store][dateKey].extended_amount +=
        extended_amount || 0;
      storeWiseMonthlyData[store][dateKey].extraSnacksPrice +=
        extraSnacksPrice || 0;
    });

    res.status(200).json(storeWiseMonthlyData);
  } catch (error) {
    console.error("Error in getDataByMonth:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTopCustomers = async (req, res) => {
  try {
    const topCustomersByStore = await Customer.aggregate([
      {
        $group: {
          _id: {
            store: "$store",
            name: "$name",
            phone: "$phone",
          },
          bookingCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.store": 1,
          bookingCount: -1,
        },
      },
      {
        $group: {
          _id: "$_id.store",
          customers: {
            $push: {
              name: "$_id.name",
              phone: "$_id.phone",
              bookingCount: "$bookingCount",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          store: "$_id",
          topCustomers: { $slice: ["$customers", 10] }, // Top 10 per store
        },
      },
    ]);

    res.status(200).json(topCustomersByStore);
  } catch (error) {
    console.error("Error in getTopCustomers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTopGamesPerStore = async (req, res) => {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const endOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    const gamesData = await Customer.aggregate([
      {
        $match: {
          created_at: { $gte: startOfPreviousMonth },
        },
      },
      {
        $project: {
          store: 1,
          game: 1,
          created_at: 1,
          isCurrentMonth: {
            $cond: [
              { $gte: ["$created_at", startOfCurrentMonth] },
              true,
              false,
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            store: "$store",
            game: "$game",
            isCurrentMonth: "$isCurrentMonth",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: {
            store: "$_id.store",
            game: "$_id.game",
          },
          currentMonthCount: {
            $sum: {
              $cond: ["$_id.isCurrentMonth", "$count", 0],
            },
          },
          previousMonthCount: {
            $sum: {
              $cond: ["$_id.isCurrentMonth", 0, "$count"],
            },
          },
        },
      },
      {
        $sort: {
          "_id.store": 1,
          currentMonthCount: -1,
          previousMonthCount: -1,
        },
      },
      {
        $group: {
          _id: "$_id.store",
          topGames: {
            $push: {
              game: "$_id.game",
              currentMonthCount: "$currentMonthCount",
              previousMonthCount: "$previousMonthCount",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          store: "$_id",
          topGames: { $slice: ["$topGames", 5] }, // Limit top 5
        },
      },
    ]);

    res.status(200).json(gamesData);
  } catch (error) {
    console.error("Error in getTopGamesPerStore:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getStoreGames,
  getTotalRevenue,
  getDataByWeek,
  getDataByMonth,
  getTopCustomers,
  getTopGamesPerStore,
};

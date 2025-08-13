// utils/logActivity.js
const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ employee, action, details = {}, store, ip, userAgent }) => {
  try {
    const log = new ActivityLog({
      employee,
      action,
      details,
      store,
      ip,
      userAgent
    });
    await log.save();
    console.log('Activity logged:', action);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = logActivity;

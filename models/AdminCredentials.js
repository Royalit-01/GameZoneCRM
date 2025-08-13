const mongoose = require("mongoose");

const adminCredentialsSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const AdminCredentials = mongoose.model(
  "AdminCredentials",
  adminCredentialsSchema
);

module.exports = AdminCredentials;

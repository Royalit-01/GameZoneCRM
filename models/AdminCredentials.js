const mongoose = require("mongoose");

const adminCredentialsSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Create default admin if none exists
adminCredentialsSchema.statics.createDefaultAdmin = async function() {
  try {
    const adminCount = await this.countDocuments();
    if (adminCount === 0) {
      await this.create({
        phone: "8458888458",
        password: "admin123"
      });
   
    }
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
};

const AdminCredentials = mongoose.model(
  "AdminCredentials",
  adminCredentialsSchema
);

// Create default admin when the model is first used
AdminCredentials.createDefaultAdmin();

module.exports = AdminCredentials;

const { Sequelize } = require("sequelize");
require("dotenv").config();

// MySQL connection (used in development)
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected");
    // Auto-sync tables (replaces Spring ddl-auto=update)
    await sequelize.sync({ alter: true });
    console.log("✅ Database tables synced");
  } catch (err) {
    console.error("❌ MySQL connection error:", err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectMySQL };

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Transaction = sequelize.define(
  "Transaction",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    month: {
      type: DataTypes.STRING(7), // "YYYY-MM"
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "transactions",
    timestamps: true,
  }
);

module.exports = Transaction;

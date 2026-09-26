const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Budget = sequelize.define(
  "Budget",
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
    month: {
      type: DataTypes.STRING(7), // "YYYY-MM"
      allowNull: false,
    },
    salary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "budgets",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "month"],
      },
    ],
  }
);

module.exports = Budget;

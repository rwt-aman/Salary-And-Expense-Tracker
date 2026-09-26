// Smart model router: exports MySQL models in dev, Mongoose models in prod
// This lets controllers stay DB-agnostic.

const isProd = process.env.NODE_ENV === "production";

let User, Budget, Transaction;

if (isProd) {
  // MongoDB / Mongoose (production)
  User = require("./User");
  Budget = require("./Budget");
  Transaction = require("./Transaction");
} else {
  // MySQL / Sequelize (development)
  User = require("./UserMySQL");
  Budget = require("./BudgetMySQL");
  Transaction = require("./TransactionMySQL");
}

module.exports = { User, Budget, Transaction };

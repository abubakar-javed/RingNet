const knex = require("../config/db/db");
const logger = require("../logger");

const checkDatabaseConnection = async () => {
  const result = await knex.raw("SELECT NOW()");

  logger.info("Database connection check successful", {
    time: result.rows[0].now,
  });
  return true;
};

module.exports = checkDatabaseConnection;

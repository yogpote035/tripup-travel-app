const { createPool, initSchema, testConnection } = require("./database/connection");
const ensureBootstrapAdmin = require("./utils/bootstrapAdmin");

const MAX_DB_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectToDatabase = async (attempt = 1) => {
  try {
    const pool = createPool();
    await testConnection(pool);
    await initSchema(pool);
    console.log("Connected To TiDB/MySQL Database");
    await ensureBootstrapAdmin();
    return pool;
  } catch (err) {
    const message = `Database connection attempt ${attempt} failed: ${err.message}`;
    console.error("⚠️", message);

    if (attempt < MAX_DB_RETRIES) {
      console.warn(`Retrying database connection in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectToDatabase(attempt + 1);
    }

    throw new Error(message);
  }
};

module.exports = connectToDatabase;

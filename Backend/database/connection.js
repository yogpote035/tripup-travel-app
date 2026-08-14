const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const { logger } = require("../Middleware/Logger");

let pool;

const splitSqlStatements = (sql) => {
    const statements = [];
    let current = "";
    let singleQuote = false;
    let doubleQuote = false;
    let backtick = false;
    let lineComment = false;
    let blockComment = false;

    for (let i = 0; i < sql.length; i += 1) {
        const char = sql[i];
        const next = sql[i + 1];

        if (lineComment) {
            current += char;
            if (char === "\n") {
                lineComment = false;
            }
            continue;
        }

        if (blockComment) {
            current += char;
            if (char === "*" && next === "/") {
                current += next;
                i += 1;
                blockComment = false;
            }
            continue;
        }

        if (char === "-" && next === "-") {
            lineComment = true;
            current += char;
            current += next;
            i += 1;
            continue;
        }

        if (char === "/" && next === "*") {
            blockComment = true;
            current += char;
            current += next;
            i += 1;
            continue;
        }

        if (char === "'" && !doubleQuote && !backtick) {
            singleQuote = !singleQuote;
            current += char;
            continue;
        }

        if (char === '"' && !singleQuote && !backtick) {
            doubleQuote = !doubleQuote;
            current += char;
            continue;
        }

        if (char === "`" && !singleQuote && !doubleQuote) {
            backtick = !backtick;
            current += char;
            continue;
        }

        if (!singleQuote && !doubleQuote && !backtick && char === ";") {
            const statement = current.trim();
            if (statement) {
                statements.push(statement);
            }
            current = "";
            continue;
        }

        current += char;
    }

    const trailingStatement = current.trim();
    if (trailingStatement) {
        statements.push(trailingStatement);
    }

    return statements.filter((statement) => statement && !statement.startsWith("--") && !statement.startsWith("/*"));
};

const createPool = () => {
    if (pool) return pool;

    const host = process.env.TIDB_HOST || process.env.DB_HOST || "localhost";
    const localHosts = ["localhost", "127.0.0.1", "::1"];
    const sslEnabled =
        process.env.TIDB_SSL === "true" ||
        process.env.DB_SSL === "true" ||
        (!localHosts.includes(host) && (host.includes("tidbcloud") || host.includes("mysql") || host.includes("aws") || host.includes("cloud")));
    const sslConfig = sslEnabled ? { rejectUnauthorized: false } : undefined;

    pool = mysql.createPool({
        host,
        port: Number(process.env.TIDB_PORT || process.env.DB_PORT || 4000),
        user: process.env.TIDB_USER || process.env.DB_USER || "root",
        password: process.env.TIDB_PASSWORD || process.env.DB_PASSWORD || "",
        database: process.env.TIDB_DATABASE || process.env.DB_NAME || "tripup",
        timezone: "Z",
        connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
        waitForConnections: true,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        ssl: sslConfig,
        multipleStatements: process.env.DB_ALLOW_MULTI_STATEMENTS === "true",
    });

    pool.on("connection", (connection) => {
        logger.info("🗄️ TiDB/MySQL connection acquired");
    });

    return pool;
};

const testConnection = async (currentPool = pool) => {
    const connection = await currentPool.getConnection();
    try {
        await connection.ping();
        logger.info("🗄️ TiDB/MySQL connection verified");
    } finally {
        connection.release();
    }
};

const initSchema = async (currentPool = pool) => {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    const statements = splitSqlStatements(schemaSql);
    const connection = await currentPool.getConnection();
    try {
        for (const statement of statements) {
            try {
                await connection.query(statement);
            } catch (error) {
                logger.error("❌ TiDB schema statement failed", {
                    statement: statement.slice(0, 200),
                    error: error.message,
                });
                throw error;
            }
        }
        logger.info("🗄️ TiDB schema initialized");
    } finally {
        connection.release();
    }
};

const query = async (sql, params = []) => {
    const currentPool = pool || createPool();
    const connection = await currentPool.getConnection();
    try {
        const [rows] = await connection.execute(sql, params);
        return rows;
    } finally {
        connection.release();
    }
};

const transaction = async (callback) => {
    const currentPool = pool || createPool();
    const connection = await currentPool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    createPool,
    testConnection,
    initSchema,
    query,
    transaction,
    getPool: () => pool,
};

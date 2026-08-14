const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const backendRoot = path.resolve(__dirname, "..");

function getSourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (["node_modules", "logs", "backups", "test"].includes(entry.name)) return [];

    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return getSourceFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".js") ? [entryPath] : [];
  });
}

test("SQL schema defines the core TripUp tables", () => {
  const schema = fs.readFileSync(path.join(backendRoot, "database", "schema.sql"), "utf8");
  const tables = [
    "users",
    "flights",
    "trains",
    "buses",
    "hotels",
    "posts",
    "audit_logs",
    "notifications",
    "booking_lifecycles",
    "seat_locks",
  ];

  tables.forEach((table) => {
    assert.match(schema, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`, "i"));
  });
});

test("backend source has no legacy ODM runtime dependency", () => {
  const removedDriver = ["mongo", "ose"].join("");
  const legacyOdmImport = new RegExp(`require\\(\\s*["']${removedDriver}["']\\s*\\)|from\\s+["']${removedDriver}["']`);
  const matches = getSourceFiles(backendRoot)
    .filter((filePath) => legacyOdmImport.test(fs.readFileSync(filePath, "utf8")))
    .map((filePath) => path.relative(backendRoot, filePath));

  assert.deepEqual(matches, []);
});

test("SQL repositories load without opening a database connection", () => {
  [
    "UserModel",
    "FlightModel",
    "TrainModel",
    "BusModel",
    "HotelModel",
    "NotificationModel",
    "AuditLogModel",
    "BookingLifecycleModel",
  ].forEach((model) => {
    assert.doesNotThrow(() => require(path.join(backendRoot, "models", model)));
  });
});

test("SQL session and notification filters support Mongo-style operators", () => {
  const SessionModel = require(path.join(backendRoot, "models", "SessionModel"));
  const NotificationModel = require(path.join(backendRoot, "models", "NotificationModel"));

  const sessionWhere = SessionModel.__test__.buildWhereClause({
    $or: [{ userId: "u-1" }, { isRevoked: false }],
    expiresAt: { $gt: new Date("2024-01-01T00:00:00.000Z") },
  });

  const notificationWhere = NotificationModel.__test__.buildWhereClause({
    user: "u-1",
    read: false,
    createdAt: { $gte: new Date("2024-01-01T00:00:00.000Z") },
  });

  assert.ok(sessionWhere.conditions.length >= 2);
  assert.ok(sessionWhere.conditions.some((clause) => clause.includes("OR")));
  assert.ok(notificationWhere.conditions.some((clause) => clause.includes("created_at")));
  assert.ok(notificationWhere.conditions.some((clause) => clause.includes("is_read")));
});

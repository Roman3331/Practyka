export const ENV = {
  PORT: Number(process.env.PORT) || 3100,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017",
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || "users_db",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
};
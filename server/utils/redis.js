const redis = require("redis");

// Load default local redis URL if REDIS_URL is not provided
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = redis.createClient({
  url: redisUrl
});

let isRedisConnected = false;

// redisClient.on("error", (err) => {
//   console.error("❌ Redis Client Error", err);
//   isRedisConnected = false;
// });

// redisClient.on("connect", () => {
//   console.log("✅ Redis Client Connected");
//   isRedisConnected = true;
// });

// redisClient.connect().catch(err => {
//   console.error("❌ Failed to connect to Redis on startup:", err);
// });

module.exports = {
  redisClient,
  isRedisConnected: () => isRedisConnected
};

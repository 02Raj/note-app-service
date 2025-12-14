const redis = require("redis");

const client = redis.createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
});

client.connect().catch(err => {
    console.error("Redis connection error:", err);
});

client.on("connect", () => {
    console.log("✅ Redis Connected");
});

client.on("error", (err) => {
    console.log("❌ Redis Error:", err);
});

module.exports = client;

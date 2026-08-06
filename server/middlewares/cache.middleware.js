const jwt = require("jsonwebtoken");
const { redisClient, isRedisConnected } = require("../utils/redis");

// Default TTL in seconds (e.g., 5 minutes = 300 seconds)
const DEFAULT_TTL = 5 * 60;

/**
 * Middleware to cache GET responses.
 */
const cacheMiddleware = (ttl = DEFAULT_TTL) => {
  return async (req, res, next) => {
    // Only cache GET requests and check if redis is connected
    if (req.method !== "GET" || !isRedisConnected()) {
      return next();
    }

    // Bypass caching for auth and documentation endpoints
    const bypassPaths = [
      "/api/auth",
      "/api-docs",
      "/api-docs.json"
    ];
    if (bypassPaths.some(path => req.originalUrl.startsWith(path)) || req.originalUrl === "/") {
      return next();
    }

    // Extract user token to identify the user for cache isolation
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return next();
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
      // Pre-populate to avoid duplicate JWT decode overhead in downstream auth middleware
      req.userId = decoded.userId;
      req.user = { id: decoded.userId };
    } catch (err) {
      return next();
    }

    const cacheKey = `${userId}:${req.originalUrl}`;
    
    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        const cachedResponse = JSON.parse(cachedData);
        res.setHeader("X-Cache", "HIT");
        return res.status(cachedResponse.statusCode).json(cachedResponse.body);
      }
    } catch (err) {
      console.error("Redis Get Error:", err);
      // Fallback to normal execution if redis fails
    }

    // Intercept res.json to cache the successful response
    const originalJson = res.json;
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          if (isRedisConnected()) {
            const cacheValue = JSON.stringify({
              body,
              statusCode: res.statusCode,
            });
            // Using setEx which sets value with expiration
            redisClient.setEx(cacheKey, ttl, cacheValue).catch(err => {
              console.error("Redis Set Error:", err);
            });
          }
        } catch (err) {
          console.error("Redis Cache Serialization Error:", err);
        }
      }
      res.json = originalJson;
      return originalJson.call(this, body);
    };

    res.setHeader("X-Cache", "MISS");
    next();
  };
};

/**
 * Invalidate cache for a specific user.
 * @param {string} userId - The ID of the user.
 */
const invalidateUserCache = async (userId) => {
  if (!userId || !isRedisConnected()) return;
  const prefix = `${userId}:*`;
  
  try {
    // In redis v4, keys method is available directly on client
    const keys = await redisClient.keys(prefix);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.error("Redis Invalidate Error:", err);
  }
};

/**
 * Middleware to invalidate cache on mutating requests (POST, PUT, DELETE, PATCH).
 */
const invalidateCacheMiddleware = (req, res, next) => {
  const mutatingMethods = ["POST", "PUT", "DELETE", "PATCH"];
  if (mutatingMethods.includes(req.method)) {
    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.userId || req.user?.id;
        if (userId) {
          invalidateUserCache(userId);
        } else {
          const token = req.headers.authorization?.split(" ")[1];
          if (token) {
            try {
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              invalidateUserCache(decoded.userId);
            } catch (err) {
              // Ignore token decode errors
            }
          }
        }
      }
    });
  }
  next();
};

module.exports = {
  cacheMiddleware,
  invalidateCacheMiddleware,
  invalidateUserCache,
};

const jwt = require("jsonwebtoken");

// Simple in-memory cache store
const cache = new Map();

// Default TTL (time-to-live) in milliseconds (e.g., 5 minutes = 300,000 ms)
const DEFAULT_TTL = 5 * 60 * 1000;

/**
 * Middleware to cache GET responses.
 */
const cacheMiddleware = (ttl = DEFAULT_TTL) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
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
      // If there is no token, don't serve from cache or cache the response
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
      // If token verification fails, don't cache or serve from cache;
      // let authMiddleware handle returning the 401 response
      return next();
    }

    const cacheKey = `${userId}:${req.originalUrl}`;
    const cachedResponse = cache.get(cacheKey);
    const now = Date.now();

    if (cachedResponse && (now - cachedResponse.timestamp < ttl)) {
      // Serve from cache
      res.setHeader("X-Cache", "HIT");
      return res.status(cachedResponse.statusCode).json(cachedResponse.body);
    }

    // Intercept res.json to cache the successful response
    const originalJson = res.json;
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, {
          body,
          statusCode: res.statusCode,
          timestamp: Date.now(),
        });
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
const invalidateUserCache = (userId) => {
  if (!userId) return;
  const prefix = `${userId}:`;
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
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
          // If userId is not set directly (e.g. auth middleware hasn't attached it yet, or token was verified elsewhere),
          // try to decode JWT token from header to find userId and clear cache
          const token = req.headers.authorization?.split(" ")[1];
          if (token) {
            try {
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              invalidateUserCache(decoded.userId);
            } catch (err) {
              // Ignore token decode errors during invalidation
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

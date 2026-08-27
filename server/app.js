require("./utils/logger.util"); // Initialize logger first to capture all console.logs
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const connectDB = require("./utils/db");
const { cacheMiddleware, invalidateCacheMiddleware } = require("./middlewares/cache.middleware");
const {
  swaggerUi,
  openApiSpec,
  swaggerOptions,
} = require("./config/openapi");

connectDB();

const app = express();
app.use(compression());
app.use(cors());
app.use(express.json());

app.use(invalidateCacheMiddleware);
app.use(cacheMiddleware());

app.get("/api-docs.json", (req, res) => {
  res.json(openApiSpec);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec, swaggerOptions));

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
const topicRoutes = require("./routes/topics.routes");
app.use("/api/topics", topicRoutes);
const subtopicRoutes = require("./routes/subtopics.routes");
app.use("/api/subtopics", subtopicRoutes);
const noteRoutes = require("./routes/notes.routes");
app.use("/api/notes", noteRoutes);
const dsaRoutes = require("./routes/dsa.routes");
app.use("/api/dsa", dsaRoutes);
const jobRoutes = require("./routes/job.routes");
app.use("/api/jobs", jobRoutes);
const { errorHandler } = require('./middlewares/error.middlewares.js');
app.use(errorHandler);
// Health check
app.get("/", (req, res) => {
  res.send("API is running");
});

module.exports = app;

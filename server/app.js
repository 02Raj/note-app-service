require("./utils/logger.util"); // Initialize logger first to capture all console.logs
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./utils/db");
const { cacheMiddleware, invalidateCacheMiddleware } = require("./middlewares/cache.middleware");
const {
  swaggerUi,
  openApiSpec,
  swaggerOptions,
} = require("./config/openapi");

dotenv.config();

connectDB();

const app = express();
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
const progressRoutes = require("./routes/progress.routes");
app.use("/api/progress", progressRoutes);
const deadlineRoutes = require("./routes/deadlines.routes");
app.use("/api/deadlines", deadlineRoutes);
const geminiRoutes = require('./routes/gemini.routes.js');
app.use('/api/gemini', geminiRoutes);
const revisionRoutes = require("./routes/revision.routes.js");
app.use("/api/revisions", revisionRoutes);
const mockInterviewRoutes = require('./routes/mockInterview.routes.js');
app.use('/api/mock-interview', mockInterviewRoutes);
const resourceRoutes = require('./routes/resource.routes');
app.use('/api/resource', resourceRoutes); // very important
const dashboardRoutes = require('./routes/dashboard.routes'); 
app.use('/api/dashboard', dashboardRoutes);
const resumeRoutes = require('./routes/resume.routes.js');
app.use('/api/resume', resumeRoutes);
const planRoutes = require("./routes/plan.routes");
app.use("/api/plans", planRoutes);
app.use("/api/contact", require("./routes/contact.routes"));
const dailyRoutineRoutes = require("./routes/dailyRoutine.routes");
app.use("/api/routine", dailyRoutineRoutes);
const expenseRoutes = require("./routes/expenses.routes");
app.use("/api/expenses", expenseRoutes);
const foodLogRoutes = require("./routes/foodLog.routes");
app.use("/api/food-log", foodLogRoutes);
const dsaRoutes = require("./routes/dsa.routes");
app.use("/api/dsa", dsaRoutes);
const interviewDashboardRoutes = require("./routes/interview-dashboard.routes");
app.use("/api/interview-dashboard", interviewDashboardRoutes);

const aiRoutes = require("./routes/ai.routes");
app.use("/api/ai", aiRoutes);

const systemRoutes = require("./routes/system.routes");
app.use("/api/system", systemRoutes);
const { errorHandler } = require('./middlewares/error.middlewares.js');
app.use(errorHandler);
// Health check
app.get("/", (req, res) => {
  res.send("API is running");
});

module.exports = app;

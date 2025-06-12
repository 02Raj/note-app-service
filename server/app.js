const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./utils/db");

dotenv.config();

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

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
const resourceRoutes = require('./routes/resource.routes.js');
app.use('/api/resources', resourceRoutes);
// Health check
app.get("/", (req, res) => {
  res.send("API is running");
});

module.exports = app;

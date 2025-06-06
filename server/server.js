const app = require("./app");

// Load port from environment variables
const PORT = process.env.PORT || 5000;



// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

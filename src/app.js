require("dotenv").config();
const express = require("express");
const db = require("./config/database");
const initializeDatabase = require("./utils/dbInit");
const profileRoutes = require("./routes/profileRoutes");
const { errorHandler, notFound } = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "GitHub Profile Analyzer API",
    version: "1.0.0",
    endpoints: {
      "POST /api/profiles/analyze": "Analyze a GitHub profile by username",
      "GET /api/profiles": "Get all analyzed profiles",
      "GET /api/profiles/:username": "Get a single profile by username",
      "DELETE /api/profiles/:username": "Delete a profile",
    },
  });
});

app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

app.use("/api/profiles", profileRoutes);

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  await db.testConnection();
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` API docs available at http://localhost:${PORT}/`);
  });
}

startServer();

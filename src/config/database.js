const mysql2 = require("mysql2/promise");
require("dotenv").config();

class Database {
  constructor() {
    this.pool = null;
  }

  getPool() {
    if (!this.pool) {
      this.pool = mysql2.createPool({
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "github_analyzer",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    }
    return this.pool;
  }

  async query(sql, params = []) {
    const pool = this.getPool();
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  async testConnection() {
    try {
      await this.query("SELECT 1");
      console.log("MySQL connected successfully");
    } catch (error) {
      console.error(" MySQL connection failed:", error.message);
      process.exit(1);
    }
  }
}

module.exports = new Database();

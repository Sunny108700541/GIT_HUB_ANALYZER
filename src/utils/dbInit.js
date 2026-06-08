const db = require("../config/database");

async function initializeDatabase() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      name VARCHAR(255),
      bio TEXT,
      email VARCHAR(255),
      location VARCHAR(255),
      company VARCHAR(255),
      blog VARCHAR(500),
      avatar_url VARCHAR(500),
      github_url VARCHAR(500),
      account_type ENUM('User', 'Organization') DEFAULT 'User',
      public_repos INT DEFAULT 0,
      public_gists INT DEFAULT 0,
      followers INT DEFAULT 0,
      following INT DEFAULT 0,
      github_created_at DATETIME,
      github_updated_at DATETIME,
      analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS repo_insights (
      id INT AUTO_INCREMENT PRIMARY KEY,
      profile_id INT NOT NULL UNIQUE,
      most_starred_repo VARCHAR(255),
      most_starred_count INT DEFAULT 0,
      most_forked_repo VARCHAR(255),
      most_forked_count INT DEFAULT 0,
      total_stars INT DEFAULT 0,
      total_forks INT DEFAULT 0,
      total_watchers INT DEFAULT 0,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS language_stats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      profile_id INT NOT NULL,
      language VARCHAR(100) NOT NULL,
      repo_count INT DEFAULT 0,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS activity_stats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      profile_id INT NOT NULL UNIQUE,
      has_website BOOLEAN DEFAULT FALSE,
      hireable BOOLEAN DEFAULT FALSE,
      twitter_username VARCHAR(100),
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    )`,
  ];

  for (const query of queries) {
    await db.query(query);
  }
  console.log("✅ Database tables initialized");
}

module.exports = initializeDatabase;

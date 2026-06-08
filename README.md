# GitHub Profile Analyzer API

A Node.js + Express + MySQL backend that fetches GitHub user profiles via the GitHub API and stores useful insights in a database.

---

## Tech Stack
- **Node.js** + **Express.js**
- **MySQL** (via mysql2)
- **GitHub REST API v3** (public, no auth required — but token recommended)
- **axios** for HTTP requests
- **dotenv** for environment config

---

## Project Structure (Layered Architecture)

```
src/
├── app.js                  ← Entry point
├── config/
│   ├── database.js         ← MySQL pool (singleton class)
│   └── github.js           ← GitHub API base config
├── controllers/
│   └── profileController.js ← Request/Response handling
├── services/
│   ├── githubService.js    ← GitHub API calls + data parsing
│   └── profileAnalyzerService.js ← Business logic
├── repositories/
│   └── profileRepository.js ← All DB queries
├── routes/
│   └── profileRoutes.js    ← Route definitions
├── middlewares/
│   └── errorHandler.js     ← Global error handler
└── utils/
    └── dbInit.js           ← Auto-creates tables on start
sql/
└── schema.sql              ← Manual DB schema (optional)
```

---

## Getting GitHub Personal Access Token (FREE)

> Without a token, GitHub allows only **60 requests/hour**.  
> With a token, it goes up to **5000 requests/hour**.

### Steps:
1. Go to **https://github.com** → Login
2. Click your profile picture → **Settings**
3. Scroll down → **Developer settings** (left sidebar)
4. Click **Personal access tokens** → **Tokens (classic)**
5. Click **Generate new token (classic)**
6. Give it a name (e.g., `github-analyzer`)
7. Set expiration (e.g., 90 days)
8. Under **Scopes**, check **`read:user`** (that's all you need)
9. Click **Generate token**
10. **Copy the token immediately** (it won't show again)
11. Paste it in your `.env` file as `GITHUB_TOKEN=ghp_xxxx...`

---

## Setup Instructions

### 1. Prerequisites
- Node.js v16+ installed
- MySQL installed and running
- Git (optional)

### 2. Clone / Download the project
```bash
git clone <your-repo-url>
cd github-analyzer
```

### 3. Install dependencies
```bash
npm install
```

### 4. Create MySQL database
```sql
-- Open MySQL and run:
CREATE DATABASE github_analyzer;
```

### 5. Configure environment
```bash
cp .env.example .env
```
Edit `.env`:
```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=github_analyzer
GITHUB_TOKEN=your_github_token_here
```

### 6. Start the server
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

You should see:
```
✅ MySQL connected successfully
✅ Database tables initialized
🚀 Server running on http://localhost:3000
```

---

## API Endpoints

### Base URL: `http://localhost:3000`

---

### 1. `POST /api/profiles/analyze`
Fetches a GitHub user's profile, analyzes it, and stores it in the database.

**Request Body:**
```json
{
  "username": "torvalds"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile 'torvalds' analyzed and stored successfully",
  "data": {
    "id": 1,
    "username": "torvalds",
    "name": "Linus Torvalds",
    "public_repos": 8,
    "followers": 240000,
    "total_stars": 23000,
    ...
  }
}
```

---

### 2. `GET /api/profiles`
Returns all analyzed profiles stored in the database.

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [ ... ]
}
```

---

### 3. `GET /api/profiles/:username`
Returns detailed data for a single stored profile including language stats.

**Example:** `GET /api/profiles/torvalds`

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "torvalds",
    "followers": 240000,
    "languages": [
      { "language": "C", "repo_count": 5 }
    ],
    ...
  }
}
```

---

### 4. `DELETE /api/profiles/:username`
Deletes a profile from the database.

**Example:** `DELETE /api/profiles/torvalds`

---

### 5. `GET /health`
Health check — confirms server and DB are running.

---

## Testing with curl

```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Analyze a profile
curl -X POST http://localhost:3000/api/profiles/analyze \
  -H "Content-Type: application/json" \
  -d '{"username": "torvalds"}'

# 3. Get all profiles
curl http://localhost:3000/api/profiles

# 4. Get single profile
curl http://localhost:3000/api/profiles/torvalds

# 5. Delete profile
curl -X DELETE http://localhost:3000/api/profiles/torvalds
```

---

## Testing with Postman
1. Download Postman: https://www.postman.com/downloads/
2. Create a new Collection: "GitHub Analyzer"
3. Add requests for each endpoint above
4. For POST request, set Body → raw → JSON

---

## Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | Core GitHub user info |
| `repo_insights` | Stars, forks, top repos |
| `language_stats` | Programming language breakdown |
| `activity_stats` | Website, hireable, Twitter |

---

## Common Errors

| Error | Fix |
|-------|-----|
| `ER_ACCESS_DENIED_ERROR` | Check DB_USER and DB_PASSWORD in .env |
| `ECONNREFUSED` | MySQL is not running — start it first |
| `GitHub API rate limit exceeded` | Add GITHUB_TOKEN to .env |
| `GitHub user 'xyz' not found` | Username doesn't exist on GitHub |

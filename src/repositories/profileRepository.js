const db = require("../config/database");

class ProfileRepository {
  async findAll() {
    return db.query(`
      SELECT 
        p.*,
        ri.most_starred_repo, ri.most_starred_count, ri.total_stars,
        ri.most_forked_repo, ri.most_forked_count, ri.total_forks
      FROM profiles p
      LEFT JOIN repo_insights ri ON ri.profile_id = p.id
      ORDER BY p.analyzed_at DESC
    `);
  }

  async findByUsername(username) {
    const profiles = await db.query(
      `SELECT p.*,
        ri.most_starred_repo, ri.most_starred_count, ri.total_stars,
        ri.most_forked_repo, ri.most_forked_count, ri.total_forks,
        ri.total_watchers,
        act.has_website, act.hireable, act.twitter_username
       FROM profiles p
       LEFT JOIN repo_insights ri ON ri.profile_id = p.id
       LEFT JOIN activity_stats act ON act.profile_id = p.id
       WHERE p.username = ?`,
      [username.toLowerCase()]
    );
    if (!profiles.length) return null;

    const profile = profiles[0];
    profile.languages = await db.query(
      "SELECT language, repo_count FROM language_stats WHERE profile_id = ? ORDER BY repo_count DESC",
      [profile.id]
    );
    return profile;
  }

  async findById(id) {
    const profiles = await db.query("SELECT * FROM profiles WHERE id = ?", [id]);
    return profiles[0] || null;
  }

  async upsert(profileData) {
    const {
      username, name, bio, email, location, company, blog,
      avatar_url, github_url, account_type, public_repos,
      public_gists, followers, following,
      github_created_at, github_updated_at,
    } = profileData;

    await db.query(
      `INSERT INTO profiles 
        (username, name, bio, email, location, company, blog,
         avatar_url, github_url, account_type, public_repos, public_gists,
         followers, following, github_created_at, github_updated_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
        name=VALUES(name), bio=VALUES(bio), email=VALUES(email),
        location=VALUES(location), company=VALUES(company), blog=VALUES(blog),
        avatar_url=VALUES(avatar_url), github_url=VALUES(github_url),
        account_type=VALUES(account_type), public_repos=VALUES(public_repos),
        public_gists=VALUES(public_gists), followers=VALUES(followers),
        following=VALUES(following), github_created_at=VALUES(github_created_at),
        github_updated_at=VALUES(github_updated_at), analyzed_at=CURRENT_TIMESTAMP`,
      [
        username.toLowerCase(), name, bio, email, location, company, blog,
        avatar_url, github_url, account_type, public_repos, public_gists,
        followers, following, github_created_at, github_updated_at,
      ]
    );

    const rows = await db.query("SELECT id FROM profiles WHERE username = ?", [username.toLowerCase()]);
    return rows[0].id;
  }

  async upsertRepoInsights(profileId, data) {
    await db.query(
      `INSERT INTO repo_insights 
        (profile_id, most_starred_repo, most_starred_count, most_forked_repo,
         most_forked_count, total_stars, total_forks, total_watchers)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        most_starred_repo=VALUES(most_starred_repo),
        most_starred_count=VALUES(most_starred_count),
        most_forked_repo=VALUES(most_forked_repo),
        most_forked_count=VALUES(most_forked_count),
        total_stars=VALUES(total_stars),
        total_forks=VALUES(total_forks),
        total_watchers=VALUES(total_watchers)`,
      [
        profileId, data.most_starred_repo, data.most_starred_count,
        data.most_forked_repo, data.most_forked_count,
        data.total_stars, data.total_forks, data.total_watchers,
      ]
    );
  }

  async upsertLanguageStats(profileId, languages) {
    await db.query("DELETE FROM language_stats WHERE profile_id = ?", [profileId]);
    for (const lang of languages) {
      await db.query(
        "INSERT INTO language_stats (profile_id, language, repo_count) VALUES (?, ?, ?)",
        [profileId, lang.language, lang.repo_count]
      );
    }
  }

  async upsertActivityStats(profileId, data) {
    await db.query(
      `INSERT INTO activity_stats (profile_id, has_website, hireable, twitter_username)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        has_website=VALUES(has_website),
        hireable=VALUES(hireable),
        twitter_username=VALUES(twitter_username)`,
      [profileId, data.has_website, data.hireable, data.twitter_username]
    );
  }

  async deleteByUsername(username) {
    return db.query("DELETE FROM profiles WHERE username = ?", [username.toLowerCase()]);
  }
}

module.exports = new ProfileRepository();

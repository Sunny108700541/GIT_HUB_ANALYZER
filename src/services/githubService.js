const axios = require("axios");
const githubConfig = require("../config/github");

class GitHubService {
  constructor() {
    this.client = axios.create({
      baseURL: githubConfig.baseURL,
      headers: githubConfig.headers,
    });
  }

  async fetchUserProfile(username) {
    try {
      const { data } = await this.client.get(`/users/${username}`);
      return data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(`GitHub user '${username}' not found`);
      }
      if (error.response?.status === 403) {
        throw new Error("GitHub API rate limit exceeded. Add a GITHUB_TOKEN in .env to increase limits.");
      }
      throw new Error(`GitHub API error: ${error.message}`);
    }
  }

  async fetchUserRepos(username) {
    try {
      const allRepos = [];
      let page = 1;
      while (true) {
        const { data } = await this.client.get(`/users/${username}/repos`, {
          params: { per_page: 100, page, type: "owner" },
        });
        if (!data.length) break;
        allRepos.push(...data);
        if (data.length < 100) break;
        page++;
      }
      return allRepos;
    } catch (error) {
      return [];
    }
  }

  parseProfile(ghUser) {
    return {
      username: ghUser.login,
      name: ghUser.name || null,
      bio: ghUser.bio || null,
      email: ghUser.email || null,
      location: ghUser.location || null,
      company: ghUser.company || null,
      blog: ghUser.blog || null,
      avatar_url: ghUser.avatar_url,
      github_url: ghUser.html_url,
      account_type: ghUser.type || "User",
      public_repos: ghUser.public_repos || 0,
      public_gists: ghUser.public_gists || 0,
      followers: ghUser.followers || 0,
      following: ghUser.following || 0,
      github_created_at: ghUser.created_at ? new Date(ghUser.created_at) : null,
      github_updated_at: ghUser.updated_at ? new Date(ghUser.updated_at) : null,
    };
  }

  parseRepoInsights(repos) {
    if (!repos.length) {
      return {
        most_starred_repo: null, most_starred_count: 0,
        most_forked_repo: null, most_forked_count: 0,
        total_stars: 0, total_forks: 0, total_watchers: 0,
      };
    }

    let mostStarred = repos[0];
    let mostForked = repos[0];
    let totalStars = 0, totalForks = 0, totalWatchers = 0;

    for (const repo of repos) {
      if (repo.stargazers_count > mostStarred.stargazers_count) mostStarred = repo;
      if (repo.forks_count > mostForked.forks_count) mostForked = repo;
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
      totalWatchers += repo.watchers_count || 0;
    }

    return {
      most_starred_repo: mostStarred.name,
      most_starred_count: mostStarred.stargazers_count,
      most_forked_repo: mostForked.name,
      most_forked_count: mostForked.forks_count,
      total_stars: totalStars,
      total_forks: totalForks,
      total_watchers: totalWatchers,
    };
  }

  parseLanguageStats(repos) {
    const langMap = {};
    for (const repo of repos) {
      if (repo.language) {
        langMap[repo.language] = (langMap[repo.language] || 0) + 1;
      }
    }
    return Object.entries(langMap)
      .map(([language, repo_count]) => ({ language, repo_count }))
      .sort((a, b) => b.repo_count - a.repo_count);
  }

  parseActivityStats(ghUser) {
    return {
      has_website: !!(ghUser.blog && ghUser.blog.trim()),
      hireable: !!ghUser.hireable,
      twitter_username: ghUser.twitter_username || null,
    };
  }
}

module.exports = new GitHubService();

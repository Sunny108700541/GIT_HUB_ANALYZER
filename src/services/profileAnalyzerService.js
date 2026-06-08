const githubService = require("./githubService");
const profileRepository = require("../repositories/profileRepository");

class ProfileAnalyzerService {
  async analyzeAndStore(username) {
    const [ghUser, repos] = await Promise.all([
      githubService.fetchUserProfile(username),
      githubService.fetchUserRepos(username),
    ]);

    const profileData = githubService.parseProfile(ghUser);
    const repoInsights = githubService.parseRepoInsights(repos);
    const languageStats = githubService.parseLanguageStats(repos);
    const activityStats = githubService.parseActivityStats(ghUser);

    const profileId = await profileRepository.upsert(profileData);

    await Promise.all([
      profileRepository.upsertRepoInsights(profileId, repoInsights),
      profileRepository.upsertLanguageStats(profileId, languageStats),
      profileRepository.upsertActivityStats(profileId, activityStats),
    ]);

    return profileRepository.findByUsername(username);
  }

  async getAllProfiles() {
    return profileRepository.findAll();
  }

  async getProfileByUsername(username) {
    const profile = await profileRepository.findByUsername(username);
    if (!profile) throw new Error(`Profile '${username}' not found in database. Analyze it first using POST /api/profiles/analyze`);
    return profile;
  }

  async deleteProfile(username) {
    const profile = await profileRepository.findByUsername(username);
    if (!profile) throw new Error(`Profile '${username}' not found`);
    await profileRepository.deleteByUsername(username);
    return { message: `Profile '${username}' deleted successfully` };
  }
}

module.exports = new ProfileAnalyzerService();

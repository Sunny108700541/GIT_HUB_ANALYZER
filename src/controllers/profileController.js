const profileAnalyzerService = require("../services/profileAnalyzerService");

class ProfileController {
  async analyzeProfile(req, res) {
    try {
      const { username } = req.body;
      if (!username || !username.trim()) {
        return res.status(400).json({ success: false, message: "username is required in request body" });
      }
      const profile = await profileAnalyzerService.analyzeAndStore(username.trim());
      return res.status(200).json({
        success: true,
        message: `Profile '${username}' analyzed and stored successfully`,
        data: profile,
      });
    } catch (error) {
      const status = error.message.includes("not found") ? 404 : 500;
      return res.status(status).json({ success: false, message: error.message });
    }
  }

  async getAllProfiles(req, res) {
    try {
      const profiles = await profileAnalyzerService.getAllProfiles();
      return res.status(200).json({
        success: true,
        count: profiles.length,
        data: profiles,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getProfileByUsername(req, res) {
    try {
      const { username } = req.params;
      const profile = await profileAnalyzerService.getProfileByUsername(username);
      return res.status(200).json({ success: true, data: profile });
    } catch (error) {
      const status = error.message.includes("not found") ? 404 : 500;
      return res.status(status).json({ success: false, message: error.message });
    }
  }

  async deleteProfile(req, res) {
    try {
      const { username } = req.params;
      const result = await profileAnalyzerService.deleteProfile(username);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      const status = error.message.includes("not found") ? 404 : 500;
      return res.status(status).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ProfileController();

const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");

router.post("/analyze", (req, res) => profileController.analyzeProfile(req, res));
router.get("/", (req, res) => profileController.getAllProfiles(req, res));
router.get("/:username", (req, res) => profileController.getProfileByUsername(req, res));
router.delete("/:username", (req, res) => profileController.deleteProfile(req, res));

module.exports = router;

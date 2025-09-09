const express = require('express');
const router = express.Router();

// Impor middleware dan controller yang dibutuhkan
const { verifyToken } = require("../middlewares/authenticate.js");
const controller = require("../controllers/user.controller.js");
const { updateProfileRules, changePasswordRules, validate } = require('../middlewares/userValidator');


// Rute untuk mendapatkan profil user yang sedang login
router.get("/profile", [verifyToken], controller.getUserProfile);
router.put("/profile", [verifyToken, updateProfileRules(), validate], controller.updateUserProfile);
router.put("/change-password", [verifyToken, changePasswordRules(), validate], controller.changePassword);

module.exports = router;
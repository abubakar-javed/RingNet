const express = require("express");
const passport = require("../config/passport");
const { login, authenticate } = require("../controller/authController");

const router = express.Router();

router.post("/login", login);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.DEPLOY_FRONTEND_URL}/login`,
  }),
  authenticate
);

module.exports = router;

const passport = require("passport");

require("dotenv").config();

const Authentication = passport.authenticate("jwt", { session: false });

module.exports = { Authentication }

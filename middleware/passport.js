const UserModel = require("../models/User");
const { Strategy, ExtractJwt } = require("passport-jwt");
require("dotenv").config();

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.jwtEncryptionKey,
};

module.exports = (passport) => {
    passport.use(
        new Strategy(options, async (payload, done) => {
            try {
                let user = await UserModel.findOne({ where: { username: payload.user_id } });
                if (!user) {
                    return done(null, false);
                }
                return done(null, user);
            } catch (err) {
                return done(err, false);
            }
        })
    );
};    
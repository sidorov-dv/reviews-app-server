const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const authController = require("../controllers/authController");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://reviews-app.herokuapp.com/google/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      const nickname = profile.displayName;
      const password = profile.provider;
      const email = profile.email;
      const avatarUrl = profile.photos[0].value;
      const userWithToken = await authController.findByEmail(email);
      if (!userWithToken) {
        const newUserWithToken = await authController.createFromSocial(
          nickname,
          password,
          email,
          avatarUrl
        );
        return done(null, newUserWithToken);
      }
      return done(null, userWithToken);
    }
  )
);

const passport = require("passport");
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const authController = require("../controllers/authController");

passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_KEY,
      clientSecret: process.env.LINKEDIN_SECRET,
      callbackURL: "https://reviews-app.herokuapp.com/linkedin/callback",
      scope: ["r_emailaddress", "r_liteprofile"],
      state: true,
    },
    function (accessToken, refreshToken, profile, done) {
      process.nextTick(async function () {
        const nickname = profile.displayName;
        const password = profile.provider;
        const email = profile.emails[0].value;
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
      });
    }
  )
);

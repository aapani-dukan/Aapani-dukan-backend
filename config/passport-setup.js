const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://aapani-dukan-backend-11.onrender.com/auth/callback"
}, (accessToken, refreshToken, profile, done) => {
    // अभी simple user object return कर रहे हैं
    done(null, {
        id: profile.id,
        email: profile.emails[0].value
    });
}));

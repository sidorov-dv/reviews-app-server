require("dotenv").config();
const passport = require("passport");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const authRouter = require("./routes/authRouter");
const reviewRouter = require("./routes/reviewRouter");
require("./config/google");
require("./config/linkedIn");

let currentGoogleUser = null;
let currentLinkedInUser = null;

passport.serializeUser(function (user, done) {
  currentGoogleUser = user;
  currentLinkedInUser = user;
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  currentGoogleUser = user;
  currentLinkedInUser = user;
  done(null, user);
});

app.use(
  session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

app.use(cors());

//Google

app.get(
  "/social/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
app.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000/socialGoogle",
    failureRedirect: "/failed",
  })
);
app.get("/successGoogle", (req, res) => {
  if (!currentGoogleUser) {
    return res.json({ message: "Something wrong!" });
  }
  res.status(200).json({
    message: "Login with Google Successful!",
    user: currentGoogleUser,
  });
});

//LinkedIn

app.get("/social/auth/linkedIn", passport.authenticate("linkedin"));
app.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    successRedirect: "http://localhost:3000/socialLinkedIn",
    failureRedirect: "/failed",
  })
);
app.get("/successLinkedIn", (req, res) => {
  if (!currentLinkedInUser) {
    return res.json({ message: "Something wrong!" });
  }
  res.status(200).json({
    message: "Login with LinkedIn successful!",
    user: currentLinkedInUser,
  });
});

/////////////////////////////////////////////////////

app.get("/failed", (req, res) => {
  res.redirect("http://localhost:3000");
});
app.get("/auth/logout", (req, res) => {
  req.session.destroy(function () {
    res.clearCookie("connect.sid");
    res.json({ message: "logout" });
  });
});

////////////////////////////////////////////////////////

app.use("/auth", authRouter);
app.use("/reviews", reviewRouter);

mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connect to DB successfully"))
  .catch((err) => console.log("Could not connect to DB", err));

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server started on PORT = ${process.env.PORT || 5000}`)
);

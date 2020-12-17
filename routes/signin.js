const { Router } = require("express");

const signinRouter = new Router();

signinRouter.get("/", (req, res) => {
  if (req.session.userID) return res.redirect("/");
  const error = req.session.error;
  delete req.session.error;
  res.render("signin.html", {
    email: req.session.email || "",
    error: error,
  });
});

signinRouter.post("/", (req, res) => {
  const { usersCollection } = require("../server.js");
  const { email, pass, stayLoggedIn } = req.body;

  verifyEmailInDB(email, usersCollection)
    .then((user) => {
      verifyUserPassword(pass, user);
      setUserSession(req, user, stayLoggedIn);
      console.log("[SIGNIN] " + user.email);
      res.redirect("/");
    })
    .catch((error) => {
      req.session.email = email;
      req.session.error = error.message;
      console.error("[ERROR] " + error);
      res.redirect("/signin");
    });
});

function verifyEmailInDB(email, collection) {
  return new Promise((resolve, reject) => {
    collection.findOne({ email: email }).then((found) => {
      if (!found) reject(new Error("This email isn't registered yet."));
      else resolve(found);
    });
  });
}

function verifyUserPassword(password, user) {
  if (password !== user.password)
    throw new Error("Email and password don't match.");
}

function setUserSession(req, user, stayLoggedIn) {
  req.session.pseudo = user.pseudo;
  req.session.email = user.email;
  req.session.userID = user._id;
  req.session.ppic = user.ppic ? `./ppic/${user.ppic}` : "/img/nopic.png";
  if (stayLoggedIn) req.session.cookie.maxAge = 3600000 * 48; // 2 days
}

function verifyIfConnected(req) {
  return Boolean(req.session);
}

module.exports = {
  signinRouter,
};

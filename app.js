const express = require("express");
const bodyparser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
  secret: "This is a Blogging Website.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/blogsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);


const blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  content: String
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  blogs: [blogSchema]
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const Blog = new mongoose.model("Blog", blogSchema);
const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});



app.get("/", function(req, res) {
  res.render("main");
});


app.get("/login", function(req, res) {
  res.render("login");
});


app.get("/signup", function(req, res) {
  res.render("signup");
});


app.get("/allBlogs", function(req, res) {

  if (req.isAuthenticated()) {
    res.render("allBlogs");
  } else {
    res.redirect("/login");
  }

  // User.find({"secret": {$ne: null}}, function(err, foundUsers){
  //   if(err){
  //     console.log(err);
  //   } else{
  //     if(foundUsers){
  //       res.render("allBlogs");
  //     }
  //   }
  // });
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});


app.post("/signup", function(req, res) {
  User.register({username: req.body.user_email}, req.body.user_password, function(err, user) {
    if (err) {
      console.log(err);
      return res.render("signup");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/allBlogs");
      });
    }
  });
});



app.post("/login", passport.authenticate("local", {
  successRedirect: "/allBlogs",
  failureRedirect: "/signup"
}), function(req, res) {});

  // const user = new User({
  //   username: req.body.email,
  //   password: req.body.password
  // });
  //
  // req.login(user, function(err) {
  //   if (err) {
  //     console.log(err);
  //     res.redirect("/signup");
  //   } else {
  //     passport.authenticate("local")(req, res, function() {
  //       res.redirect("/allBlogs");
  //     });
  //   }
  // });
// });









app.listen(3000, function(req, res) {
  console.log("Server has started at port 3000 --> ");
});

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { v4: uuidv4 } = require('uuid');
var cookieParser = require('cookie-parser')

const homeStartingContent = "Welcome to your Daily Log. This is where all of your posts are located. Navigate to the compose tab to add a post. Click READ MORE to expand content, and DELETE to remove the post. To switch accounts, navigate to the /login route or press SWITCH ACCOUNT.";
const aboutContent = "Daily Log allows users to store posts in their own unique arrays. Posts can currently be created, read and deleted, with update features coming soon.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());

mongoose.connect("mongodb://localhost:27017/logDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  posts: [{_id:String, title:String, content:String}]
});

const User = mongoose.model("User", userSchema);

// TODO: clean up/remove unused packages
// TODO: make email already exists alert for registering
// TODO: Styling
// TODO: Use newer version of Bootstrap
// TODO: add edit functionality for posts
// TODO: General code cleanup/optimization
// TODO: Improve Security

app.get("/", function(req, res){
  if(req.cookies.username) {
    User.findOne({email: req.cookies.username}, function(err, foundUser){
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          res.render("home", {
            startingContent: homeStartingContent,
            posts: foundUser.posts
         });
        }
      }
    });
  } else {
    res.render("login");
  }
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/about", function(req, res){
  if(req.cookies.username) {
    res.render("about", {aboutContent: aboutContent});
  } else {
    res.render("login");
  }
});

app.get("/compose", function(req, res){
  if(req.cookies.username) {
    res.render("compose");
  } else {
    res.render("login");
  }
});

app.post("/register", function(req, res){
  bcrypt.hash(req.body.password, saltRounds, function(err, hash){
    const newUser = new User({
      email: req.body.username,
      password: hash,
      posts: []
    });

    newUser.save(function(err){
      if(err) {
        res.redirect("/register");
      } else {
        res.cookie('username', req.body.username, { httpOnly: true });
         res.render("home", {
           startingContent: homeStartingContent,
           posts: newUser.posts
        });
      }
    });
  });
});

app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if (err) {
      res.redirect("/login");
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result){
          if (result === true) {
            res.cookie('username', req.body.username, { httpOnly: true });
             res.render("home", {
               startingContent: homeStartingContent,
               posts: foundUser.posts
            });
          }
        });
      }
    }
  });
});

app.post("/compose", function(req, res){
  if (!req.cookies.username) {
    res.redirect("/login");
  }

  const id = uuidv4();

  const post = {
    _id: id,
   title: req.body.postTitle,
   content: req.body.postBody
 };

 const username = req.cookies.username;

 // update user with new post

 User.findOne({email: username}, function(err, foundUser){
   if (err) {
     console.log(err);
   } else {
     if (foundUser) {
       User.updateOne(
           { email: username },
           {$push: {posts: {$each: [post]}}},
           function(err) {
             if (err) {
               console.log(err);
             }
          });
     }
   }
 });
 setTimeout(function() {
   res.redirect("/");
 }, 300);
});

app.get("/posts/:postId", function(req, res){
  if (!req.cookies.username) {
    res.redirect("/login");
  }

  const requestedPostId = req.params.postId;

  // fetch requested post

  User.findOne({email: req.cookies.username}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.posts.forEach(function(post){
          if (post._id === requestedPostId) {
            res.render("post", {
              title: post.title,
              content: post.content
            });
          }
        });
      }
    }
  });
});

app.get("/delete/:postId", function(req, res){
  if (!req.cookies.username) {
    res.redirect("/login");
  }

  const requestedPostId = req.params.postId;
  const username = req.cookies.username;

  // delete requested post

  User.findOne({email: username}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        User.updateOne(
            { email: username },
            {$pull: {posts: { _id: requestedPostId }}},
            function(err) {
              if (err) {
                console.log(err);
              }
           });
      }
    }
  });
  setTimeout(function() {
    res.redirect("/");
  }, 300);
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
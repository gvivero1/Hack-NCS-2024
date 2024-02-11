const express = require("express");
const { v4: uuidv4 } = require("uuid");
const morgan = require("morgan");
const multer = require("multer");
const mongoose = require("mongoose");
const client = require("./db");
const User = require("./models/userModels");
const { getAllPosts } = require("./controllers/postController");
const { getAllUsers } = require("./controllers/userController");
const bcrypt = require("bcrypt");
const Post = require("./models/postModels");
const session = require("express-session");

const saltRounds = 10;

const app = express();

let port = 3000;

let host = "localhost";

const uri = client.uri;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    (result) => console.log("Connected to the database"),
    app.listen(port, host, () => {
      console.log("The server is running at port", port);
    })
  )
  .catch((err) => console.log(err));

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
// app.use(morgan("dev"));

//creates a session for users
app.use(
  session({
    secret: client.myLongSessionKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set to true if you're using https
  })
);

const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = await User.findOne({ username: username });
  if (!user) {
    console.error("User not found");
    return res.status(404).send("User not found");
  }
  const match = bcrypt.compareSync(password, user.password);
  if (match) {
    req.session.userId = user.id;
    console.log(req.session.userId);

    // Save the session before redirecting
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
        return res.status(500).send("Error saving session");
      } else {
        console.log("Session saved");

        // Redirect to the profile page of the logged-in user
        res.redirect("/profile");
      }
    });
  } else {
    console.error("Password is incorrect");
    res.status(401).send("Password is incorrect");
  }
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", upload.single("profileImage"), async (req, res) => {
  console.log(req.body);

  let user = new User();
  user.id = uuidv4();
  user.username = req.body.username;
  user.name = req.body.name;
  // hash's the password and stores it into the users password field (hashing the password for security purposes)
  const plaintextPassword = req.body.password;
  if (plaintextPassword.length < 8) {
    console.error("Password should be at least 8 characters");
    return res.status(400).send("Password should be at least 8 characters");
  }
  if (!plaintextPassword) {
    console.error("Password is required");
    return res.status(400).send("Password is required");
  }
  const hash = bcrypt.hashSync(plaintextPassword, saltRounds);
  user.password = hash;

  //   user.password = req.body.password;
  user.email = req.body.email;

  if (req.file) {
    user.profileImage = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };
  }
  // add user to the database
  try {
    await user.save();
    res.redirect("/login");
  } catch (err) {
    // If there's a validation error, send the error message to the frontend
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    }

    // If it's not a validation error, send a generic error message
    return res.status(500).send("An error occurred while registering the user");
  }

  // user.save().then((result) => {
  //   res.redirect("/login");
  // });
});

app.get("/displayUsers", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.render("displayUsers", { users: users });
  } catch (err) {
    console.error("Error retrieving users:", err);
    res.status(500).send("Error retrieving users");
  }
});

app.get("/profile", async (req, res) => {
  if (!req.session.userId) {
    console.error("User is not logged in");
    return res.status(401).send("User is not logged in");
  }

  let user = await User.findOne({ id: req.session.userId });

  // const userId = req.session.userId;

  res.render("profile", { user });
});

app.get("/createPost", (req, res) => {
  res.render("createPost");
});

app.post("/createPost", upload.array("images", 10), async(req, res) => {
  let post = new Post();
  // post.id = uuidv4();
  let user = await User.findOne({ id: req.session.userId });
  post.createdBy = user;
  console.log(user);

  post.title = req.body.title;
  post.content = req.body.content;
  //post.createdBy = req.body.createdBy;
  post.likes = 0;
  post.category = req.body.category;
  post.cost = req.body.cost;
  // post date will be set to the date the post was created
  post.date = new Date();
  post.season = req.body.season;
  post.city = req.body.city;

  if (req.files) {
    post.images = req.files.map((file) => {
      return {
        data: file.buffer,
        contentType: file.mimetype,
      };
    });
  }

  post.save().then((result) => {
    res.redirect("/");
  });
});

app.get("/posts", async (req, res) => {
  try {
    const posts = await getAllPosts();
    res.render("posts", { posts: posts });
  } catch (err) {
    console.error("Error retrieving post:", err);
    res.status(500).send("Error retrieving post");
  }
});
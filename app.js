const express = require("express");
const { v4: uuidv4 } = require("uuid");
const morgan = require("morgan");
const multer = require("multer");
const mongoose = require("mongoose");
const client = require("./db");
const User = require("./models/userModels");
const { getAllUsers } = require("./controllers/userController");
const bcrypt = require("bcrypt");
const Post = require("./models/postModels");

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

const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", upload.single("profileImage"), (req, res) => {
  console.log(req.body);

  let user = new User();
  user.id = uuidv4();
  user.username = req.body.username;
  // hash's the password and stores it into the users password field (hashing the password for security purposes)
  const plaintextPassword = req.body.password;
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
  user.save().then((result) => {
    res.redirect("/login");
  });
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

app.get("/createPost", (req, res) => {
  res.render("createPost");
});

app.post("/createPost", upload.array("images", 10), (req, res) => {
  let post = new Post();
  // post.id = uuidv4();
  post.title = req.body.title;
  post.content = req.body.content;
  //post.createdBy = req.body.createdBy;
  post.likes = 0;
  post.category = req.body.category;
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

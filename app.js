const express = require("express");
const { v4: uuidv4 } = require("uuid");
const morgan = require("morgan");
const multer = require("multer");
const mongoose = require("mongoose");
const client = require("./db");
const User = require("./models/userModels");

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
  user.password = req.body.password;
  user.email = req.body.email;

  if (req.file) {
    user.profileImage = req.file.buffer;
    user.profileImage.contentType = req.file.mimetype;
  }
  // add user to the database
  user.save().then((result) => {
    res.redirect("/");
  });
});

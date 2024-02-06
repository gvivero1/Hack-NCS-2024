// userModel.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  id: { type: String },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return v.length >= 8; // replace 8 with your desired minimum length
      },
      message: (props) => `Password should be at least 8 characters!`,
    },
  },

  profileImage: {
    data: Buffer,
    contentType: String,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String },
  content: { type: String },
  //add array of images
  images: [
    {
      data: Buffer,
      contentType: String,
    },
  ],
  //add array of comments
  comments: [
    {
      id: { type: String },
      content: { type: String },
    },
  ],
  likes: { type: Number },
  category: { type: String },
  date: { type: Date },
  season: { type: String },
  city: { type: String },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;

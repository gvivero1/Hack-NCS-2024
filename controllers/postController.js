const Post = require("../models/postModels");

async function getAllPosts() {
  try {
    const posts = await Post.find().populate('createdBy').exec();
    return posts;
  } catch (err) {
    console.error("Error retrieving Posts:", err);
    throw err; // Rethrow the error to be handled where the function is called
  }
}

module.exports = { getAllPosts };

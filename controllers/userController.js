const User = require("../models/postModels");

async function getAllUsers() {
  try {
    const users = await User.find({}).exec();
    return users;
  } catch (err) {
    console.error("Error retrieving users:", err);
    throw err; // Rethrow the error to be handled where the function is called
  }
}

module.exports = { getAllUsers };

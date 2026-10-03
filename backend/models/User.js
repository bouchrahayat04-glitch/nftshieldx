const mongoose = require("mongoose"); 

const UserSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    default: function () {
      return "Anonymous" + Math.floor(Math.random() * 10000);
    },
  },
  avatar: {
    type: String,
    default: "http://localhost:3000/profile-pictures/pp.jpg"
  },
  
  bio: {
    type: String,
    default: "",
  },
    nonce: { type: String }, 
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);

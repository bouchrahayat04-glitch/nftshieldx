const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  cid: { type: String, 
    required: true }, // IPFS hash
  author: { type: String,
     required: true }, // Wallet address or username
  text: { type: String, 
    required: true },
  createdAt: { type: Date, 
    default: Date.now },
});

module.exports = mongoose.model("comment", commentSchema);

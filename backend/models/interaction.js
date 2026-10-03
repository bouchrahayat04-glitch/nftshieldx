const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema({
  cid: { type: String, required: true, unique: true },
  views: { type: [String], default: [] }, // array of wallet addresses
  likes: { type: [String], default: [] },
  dislikes: { type: [String], default: [] }
});

module.exports = mongoose.model("Interaction", interactionSchema);

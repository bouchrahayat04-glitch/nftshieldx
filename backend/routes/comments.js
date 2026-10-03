// routes/comment.js
const express = require("express");
const router = express.Router();
const Comment = require("../models/comment");
const User = require("../models/User");


// GET /api/comments/:cid - Get all comments for an NFT
router.get("/:cid", async (req, res) => {
  try {
    const comments = await Comment.find({ cid: req.params.cid }).sort({ createdAt: -1 });

    // Fetch usernames for each comment
    const enrichedComments = await Promise.all(comments.map(async (comment) => {
      const user = await User.findOne({ walletAddress: comment.author });
      return {
        ...comment._doc,
        author: user ? user.username : comment.author, // fallback to address if no username
      };
    }));

    res.json(enrichedComments);
  } catch (err) {
    console.error("❌ GET /comments/:cid error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// POST /api/comments - Add a new comment
router.post("/", async (req, res) => {
  const { cid, author, text } = req.body;

  if (!cid || !text || !author) {
    return res.status(400).json({ message: "CID and text are required" });
  }

  try {
    const newComment = new Comment({
      cid,
      author: author,
      text,
    });

    await newComment.save();

    const user = await User.findOne({ walletAddress: author });

    const enrichedComment = {
      ...newComment._doc,
      author: user ? user.username : author,
    };

    res.status(201).json(enrichedComment);
  } catch (err) {
    console.error("❌ POST /comments error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

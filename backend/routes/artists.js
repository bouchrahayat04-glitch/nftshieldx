const express = require("express");
const router = express.Router(); 
const User = require("../models/User");

// GET /api/artists
router.get("/all", async (req, res) => {
  try {
    const users = await User.find({}, "username avatar createdAt walletAddress");
    res.json(users);
  } catch (err) {
    console.error("Error fetching artists:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/artists/search?q=name
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) return res.json([]);

    const regex = new RegExp(`^${query}`, "i"); // case-insensitive "starts with"
    const users = await User.find({ username: regex })
      .select("username avatar walletAddress")
      .limit(5);

    res.json(users);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;

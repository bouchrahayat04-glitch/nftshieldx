const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET /api/artists/:walletAddress (public artist profile)
router.get("/:walletAddress", async (req, res) => {
  try {
    const wallet = req.params.walletAddress;
    const user = await User.findOne({ walletAddress: wallet });

    if (!user) {
      return res.status(404).json({ message: "Artist not found" });
    }

    res.json({
      username: user.username,
      bio: user.bio,
      avatar: user.avatar || "/profile-pictures/pp.jpg",
      walletAddress: user.walletAddress,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("Public Artist Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

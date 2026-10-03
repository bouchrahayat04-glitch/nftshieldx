const express = require("express");
const router = express.Router(); 
const User = require("../models/User");

// PUT /api/profile/edit
  router.put("/edit", async (req, res) => {
    try {
      const { walletAddress, username, avatar, bio } = req.body;
  
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }
  
      const user = await User.findOne({ walletAddress });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      if (username) user.username = username;
      if (avatar) user.avatar = avatar;
      if (bio) user.bio = bio;
  
      await user.save();
  
      res.json({ message: "✅ Profile updated", user });
    } catch (err) {
      console.error("Profile Update Error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  
// GET /api/profile/:walletAddress
router.get("/:walletAddress", async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.params.walletAddress });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      username: user.username,
      bio: user.bio,
      avatar: user.avatar || "/profile-pictures/pp.jpg",
    });
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

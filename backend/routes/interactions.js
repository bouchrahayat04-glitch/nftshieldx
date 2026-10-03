// routes/interactions.js
const express = require("express");
const router = express.Router();
const Interaction = require("../models/interaction");

// POST /interactions/view - Track view (1 per user per NFT)
router.post("/view", async (req, res) => {
    const { cid, walletAddress } = req.body;
  
    try {
      let interaction = await Interaction.findOne({ cid });
      if (!interaction) {
        interaction = new Interaction({ cid, views: [walletAddress] });
      } else if (!interaction.views.includes(walletAddress)) {
        interaction.views.push(walletAddress);
      }
  
      await interaction.save();
      res.status(200).json({ message: "View tracked" });
    } catch (err) {
      console.error("View error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });
  

// GET /interactions/:cid - Fetch likes & views
router.get("/:cid", async (req, res) => {
  try {
    const interaction = await Interaction.findOne({ cid: req.params.cid });
    res.json({
      views: interaction?.views?.length || 0,
      likes: interaction?.likes?.length || 0,
    });
  } catch (err) {
    console.error("Fetch stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /interactions/like - Toggle like (1 per user per NFT)
router.post("/like", async (req, res) => {
    const { cid, walletAddress } = req.body;
  
    try {
      let interaction = await Interaction.findOne({ cid });
      if (!interaction) {
        interaction = new Interaction({ cid, likes: [walletAddress] });
      } else {
        const hasLiked = interaction.likes.includes(walletAddress);
        if (hasLiked) {
          interaction.likes = interaction.likes.filter(addr => addr !== walletAddress);
        } else {
          interaction.likes.push(walletAddress);
        }
      }
  
      await interaction.save();
      res.status(200).json({
        liked: interaction.likes.includes(walletAddress),
        likes: interaction.likes.length,
      });
    } catch (err) {
      console.error("Like error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });
  

// GET /interactions/liked/:cid/:wallet - Check if user liked
router.get("/liked/:cid/:wallet", async (req, res) => {
  try {
    const { cid, wallet } = req.params;
    const interaction = await Interaction.findOne({ cid });
    const liked = interaction?.likes?.includes(wallet) || false;
    res.json({ liked });
  } catch (err) {
    console.error("Like check error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/dislike", async (req, res) => {
    const { cid, walletAddress } = req.body;
  
    if (!cid || !walletAddress) {
      return res.status(400).json({ message: "CID and walletAddress required" });
    }
  
    try {
      let interaction = await Interaction.findOne({ cid });
  
      if (!interaction) {
        interaction = new Interaction({ cid, views: [], likes: [], dislikes: [walletAddress] });
      } else {
        const index = interaction.dislikes.indexOf(walletAddress);
        if (index > -1) {
          interaction.dislikes.splice(index, 1); // remove if already disliked
        } else {
          interaction.dislikes.push(walletAddress); // add new dislike
        }
      }
  
      await interaction.save();
      res.json({
        disliked: interaction.dislikes.includes(walletAddress),
      });
    } catch (err) {
      console.error("Dislike error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // GET /api/interactions/disliked/:cid/:walletAddress
  router.get("/disliked/:cid/:walletAddress", async (req, res) => {
    const { cid, walletAddress } = req.params;
  
    try {
      const interaction = await Interaction.findOne({ cid });
      const disliked = interaction?.dislikes?.includes(walletAddress) || false;
  
      res.json({ disliked });
    } catch (err) {
      console.error("Get dislike check error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports = router;


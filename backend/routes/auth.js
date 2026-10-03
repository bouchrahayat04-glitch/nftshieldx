const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const nonces = {}; // temporary in-memory store

// 🔑 Route to get nonce for a wallet
router.post("/nonce", async (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ message: "Wallet address is required" });
  }

  // Generate a random 6-digit nonce
  const nonce = Math.floor(Math.random() * 1000000).toString();
  nonces[walletAddress] = nonce;

  res.json({ nonce });
});


// POST /connect-wallet
router.post("/connect-wallet", async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return res.status(400).json({ message: "Missing wallet address or signature" });
    }

    const nonce = nonces[walletAddress];
    if (!nonce) {
      return res.status(400).json({ message: "Nonce not found for this wallet" });
    }

    // Reconstruct the original message
    const message = `Sign this message to confirm wallet ownership: ${nonce}`;

    // Verify signature
    const recoveredAddress = require("ethers").ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    // Remove nonce after use
    delete nonces[walletAddress];

    // Find or create user
    let user = await User.findOne({ walletAddress });
    if (!user) {
       const userCount = await User.countDocuments();
            const defaultUsername = `Anonymous${userCount + 1}`;
            user = await User.create({
              walletAddress,
              username: defaultUsername,
              avatar: "http://localhost:3000/profile-pictures/pp.jpg",
              bio: "",
            });
    }

    // JWT
    const token = jwt.sign({ walletAddress }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "Authenticated",
      token,
      user: {
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        walletAddress: user.walletAddress,
      },
     });

  } catch (err) {
    console.error("Wallet Connect Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;

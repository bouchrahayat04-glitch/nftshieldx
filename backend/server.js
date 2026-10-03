const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/artists", require("./routes/artists")); 
app.use("/api/artist-profile", require("./routes/ArtistProfile"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/interactions", require("./routes/interactions"));





// DB & Server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("🔥 MongoDB Connected");
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


const app = express();
const PORT = process.env.PORT_BACKEND_2 || 5001;

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" })); // Allow all origins

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI_1, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// User Schema
const userSchema = new mongoose.Schema({ username: String });
const User = mongoose.model("User", userSchema);

// Activity Schema
const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: String, // Fed, Played, Walked
  duration: Number, // In minutes
  timestamp: { type: Date, default: Date.now },
});
const Activity = mongoose.model("Activity", activitySchema);

// 🟢 Route: Fetch or Create User
app.get("/users/get-id", async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: "Username is required" });
  try {
    let user = await User.findOne({ username });
    if (!user) {
      user = new User({ username });
      await user.save();
      console.log(`✅ New user created: ${username}`);
    }
    res.json({ userId: user._id });
  } catch (error) {
    console.error("❌ Error fetching or creating user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// 🟢 Route: Add Activity
app.post("/api/activities", async (req, res) => {
  const { userId, type, duration } = req.body;
  if (!userId || !type || !duration) return res.status(400).json({ error: "All fields are required" });
  try {
    const newActivity = new Activity({ userId, type, duration });
    await newActivity.save();
    res.status(201).json({ message: "Activity logged successfully", newActivity });
  } catch (error) {
    res.status(500).json({ error: "Server error while saving activity" });
  }
});

// 🟢 Route: Fetch User Activities
app.get("/api/activities", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "User ID is required" });
  try {
    const activities = await Activity.find({ userId }).sort({ timestamp: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Error fetching activities" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

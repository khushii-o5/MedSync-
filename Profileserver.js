require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' })); // Allow all origins
app.use(express.json());

console.log("MongoDB URI:", process.env.MONGO_URI_1);

mongoose.connect(process.env.MONGO_URI_1, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const UserSchema = new mongoose.Schema({
  email:String,
  name: String,
  age: String,
  height: String,
  weight: String,
  bloodType: String,
  prescriptions: [{ name: String, uri: String }]
});

const User = mongoose.model('User', UserSchema);

app.get('/get-user/:name', async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.name });
    if (!user) return res.status(404).json({ error: '❌ User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.put('/update-user/:name', async (req, res) => {
  console.log(`🔄 Updating user: ${req.params.name}`); // Debug log

  try {
    const user = await User.findOneAndUpdate(
      { name: req.params.name }, // Find user by name
      { $set: req.body }, // Update fields from request body
      { new: true, runValidators: true }
    );

    if (!user) {
      console.log("❌ User not found for update");
      return res.status(404).json({ error: "❌ User not found" });
    }

    console.log("✅ User updated:", user);
    res.json(user);
  } catch (error) {
    console.error("❌ Update Error:", error);
    res.status(500).json({ error: error.message });
  }
});


const PORT = process.env.PORT_BACKEND_1 || 8081;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

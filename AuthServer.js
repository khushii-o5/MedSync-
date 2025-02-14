require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");


dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI_2;
const JWT_SECRET = process.env.JWT_SECRET;


// ✅ Correctly connect to MongoDB once
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));




const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },  
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});


const User = mongoose.model("users", UserSchema);


// ✅ Register API
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
   
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Please provide name, email, and password" });
    }


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();


    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ✅ Login API
app.post("/login", async (req, res) => {
  const { email, password } = req.body;


  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });


    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});
app.listen(PORT, "0.0.0.0", () => console.log('🚀 Server running on http://0.0.0.0:${PORT}' ));



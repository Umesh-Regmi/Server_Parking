import User from "../models/user.js"; // Make sure the file extension is .js
import jwt from "jsonwebtoken";

// Secret for JWT (in real projects, store in .env)
const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    // Validate role
    if (!["user", "spot_host"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create and save user
    const user = new User({ name, email, password, role });
    await user.save();

    // Create JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      message: `${
        role === "spot_host" ? "Spot host" : "User"
      } registered successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

// Login existing user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

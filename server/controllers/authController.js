const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res) => {
  const { username, email, password, teamName } = req.body;
  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    const user = await User.create({ username, email, password, teamName });
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      teamName: user.teamName,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      teamName: user.teamName,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getMe };

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');
const {
  validateEmail,
  validateName,
  validateAddress,
  validatePassword,
} = require('../utils/validators');

// Register normal user
const register = async (req, res) => {
  try {
    const { name, email, address, password } = req.body;

    // Validation
    if (!validateName(name)) {
      return res.status(400).json({
        message: 'Validation failed: Name must be between 20 and 60 characters.',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: 'Validation failed: Invalid email format.',
      });
    }

    if (!validateAddress(address)) {
      return res.status(400).json({
        message: 'Validation failed: Address must not exceed 400 characters.',
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          'Validation failed: Password must be 8-16 characters long, containing at least 1 uppercase letter and 1 special character.',
      });
    }

    const existingUser = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      address: address.trim(),
      password: hashedPassword,
      role: 'NORMAL_USER',
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

// Update password for logged in user
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message:
          'Validation failed: New password must be 8-16 characters long, containing at least 1 uppercase letter and 1 special character.',
      });
    }

    const user = await User.findByPk(userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully!' });
  } catch (error) {
    console.error('Update Password Error:', error);
    return res.status(500).json({ message: 'Server error updating password.', error: error.message });
  }
};

// Get profile of current user
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        address: req.user.address,
        role: req.user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

module.exports = {
  register,
  login,
  updatePassword,
  getMe,
};

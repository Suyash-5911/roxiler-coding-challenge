const bcrypt = require('bcryptjs');
const { Op, Sequelize } = require('sequelize');
const { User, Store, Rating } = require('../models');
const {
  validateEmail,
  validateName,
  validateAddress,
  validatePassword,
} = require('../utils/validators');

// Admin Dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    return res.status(200).json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ message: 'Error fetching stats.', error: error.message });
  }
};

// Add new user (Admin, Normal User, or Store Owner)
const addUser = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

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

    const validRoles = ['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'];
    const userRole = role && validRoles.includes(role) ? role : 'NORMAL_USER';

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
      role: userRole,
    });

    return res.status(201).json({
      message: 'User created successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error adding user:', error);
    return res.status(500).json({ message: 'Error adding user.', error: error.message });
  }
};

// Add new store
const addStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!validateName(name)) {
      return res.status(400).json({
        message: 'Validation failed: Store name must be between 20 and 60 characters.',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: 'Validation failed: Invalid store email format.',
      });
    }

    if (!validateAddress(address)) {
      return res.status(400).json({
        message: 'Validation failed: Address must not exceed 400 characters.',
      });
    }

    let parsedOwnerId = null;
    if (ownerId) {
      const owner = await User.findByPk(ownerId);
      if (!owner || owner.role !== 'STORE_OWNER') {
        return res.status(400).json({ message: 'Selected owner must be a valid Store Owner.' });
      }
      parsedOwnerId = owner.id;
    }

    const store = await Store.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      address: address.trim(),
      ownerId: parsedOwnerId,
    });

    return res.status(201).json({
      message: 'Store created successfully.',
      store,
    });
  } catch (error) {
    console.error('Error adding store:', error);
    return res.status(500).json({ message: 'Error adding store.', error: error.message });
  }
};

// Get list of users with rating if Store Owner, search/filter & sorting
const getUsers = async (req, res) => {
  try {
    const { search, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const whereClause = {};
    if (role) {
      whereClause.role = role;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
      include: [
        {
          model: Store,
          as: 'ownedStores',
          attributes: ['id', 'name', 'address'],
          include: [
            {
              model: Rating,
              as: 'ratings',
              attributes: ['rating'],
            },
          ],
        },
      ],
      order: [[sortBy, sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']],
    });

    // Process ratings for store owners
    const formattedUsers = users.map((user) => {
      let rating = null;
      let storeName = null;

      if (user.role === 'STORE_OWNER' && user.ownedStores && user.ownedStores.length > 0) {
        const primaryStore = user.ownedStores[0];
        storeName = primaryStore.name;
        const storeRatings = primaryStore.ratings || [];
        if (storeRatings.length > 0) {
          const sum = storeRatings.reduce((acc, r) => acc + r.rating, 0);
          rating = (sum / storeRatings.length).toFixed(1);
        } else {
          rating = 'No ratings';
        }
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        rating: user.role === 'STORE_OWNER' ? rating : 'N/A',
        storeName: storeName,
        createdAt: user.createdAt,
      };
    });

    return res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Error fetching users.', error: error.message });
  }
};

// Get list of stores with overall average rating, search & sorting
const getStores = async (req, res) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    const stores = await Store.findAll({
      where: whereClause,
      include: [
        {
          model: Rating,
          as: 'ratings',
          attributes: ['rating'],
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    let formattedStores = stores.map((store) => {
      const ratings = store.ratings || [];
      let overallRating = 0;
      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        overallRating = Number((sum / ratings.length).toFixed(1));
      }

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner: store.owner ? store.owner.name : 'Unassigned',
        overallRating: overallRating > 0 ? overallRating : 'No ratings',
        ratingCount: ratings.length,
        createdAt: store.createdAt,
      };
    });

    // In-memory sorting for fields including computed overallRating
    formattedStores.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'overallRating') {
        valA = typeof a.overallRating === 'number' ? a.overallRating : -1;
        valB = typeof b.overallRating === 'number' ? b.overallRating : -1;
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder.toUpperCase() === 'DESC' ? 1 : -1;
      if (valA > valB) return sortOrder.toUpperCase() === 'DESC' ? -1 : 1;
      return 0;
    });

    return res.status(200).json(formattedStores);
  } catch (error) {
    console.error('Error fetching admin stores:', error);
    return res.status(500).json({ message: 'Error fetching stores.', error: error.message });
  }
};

// Get details of a single user
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
      include: [
        {
          model: Store,
          as: 'ownedStores',
          include: [
            {
              model: Rating,
              as: 'ratings',
              attributes: ['rating'],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let rating = 'N/A';
    let storeInfo = null;

    if (user.role === 'STORE_OWNER' && user.ownedStores && user.ownedStores.length > 0) {
      const primaryStore = user.ownedStores[0];
      const storeRatings = primaryStore.ratings || [];
      if (storeRatings.length > 0) {
        const sum = storeRatings.reduce((acc, r) => acc + r.rating, 0);
        rating = (sum / storeRatings.length).toFixed(1);
      } else {
        rating = 'No ratings yet';
      }

      storeInfo = {
        id: primaryStore.id,
        name: primaryStore.name,
        address: primaryStore.address,
        rating,
        totalRatings: storeRatings.length,
      };
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        rating: user.role === 'STORE_OWNER' ? rating : 'N/A',
        storeInfo,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return res.status(500).json({ message: 'Error fetching user details.', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  addUser,
  addStore,
  getUsers,
  getStores,
  getUserDetails,
};

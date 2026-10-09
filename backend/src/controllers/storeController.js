const { Op } = require('sequelize');
const { Store, Rating, User } = require('../models');

// Get all stores with search by Name and Address, overall rating, and current user's rating
const getStoresForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, address, search, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const whereClause = {};

    // Specific field search or general search query
    if (name) {
      whereClause.name = { [Op.like]: `%${name}%` };
    }
    if (address) {
      whereClause.address = { [Op.like]: `%${address}%` };
    }
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    const stores = await Store.findAll({
      where: whereClause,
      include: [
        {
          model: Rating,
          as: 'ratings',
          attributes: ['id', 'userId', 'rating'],
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

      // Check if logged in normal user has already rated this store
      const userRatingObj = ratings.find((r) => r.userId === userId);
      const userSubmittedRating = userRatingObj ? userRatingObj.rating : null;

      return {
        id: store.id,
        name: store.name,
        address: store.address,
        email: store.email,
        overallRating: overallRating > 0 ? overallRating : 'No ratings',
        ratingCount: ratings.length,
        userSubmittedRating: userSubmittedRating,
        isRated: userSubmittedRating !== null,
      };
    });

    // Sorting logic
    formattedStores.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'overallRating') {
        valA = typeof a.overallRating === 'number' ? a.overallRating : -1;
        valB = typeof b.overallRating === 'number' ? b.overallRating : -1;
      } else if (sortBy === 'userSubmittedRating') {
        valA = a.userSubmittedRating || -1;
        valB = b.userSubmittedRating || -1;
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
    console.error('Error fetching stores for user:', error);
    return res.status(500).json({ message: 'Error fetching stores.', error: error.message });
  }
};

// Submit or Modify rating for a store (1 to 5)
const submitOrUpdateRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId, rating } = req.body;

    if (!storeId || !rating) {
      return res.status(400).json({ message: 'Store ID and rating (1-5) are required.' });
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
    }

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    let ratingRecord = await Rating.findOne({
      where: { userId, storeId },
    });

    let isNew = false;
    if (ratingRecord) {
      ratingRecord.rating = numRating;
      await ratingRecord.save();
    } else {
      ratingRecord = await Rating.create({
        userId,
        storeId,
        rating: numRating,
      });
      isNew = true;
    }

    // Calculate updated store overall rating
    const allRatings = await Rating.findAll({ where: { storeId } });
    const sum = allRatings.reduce((acc, r) => acc + r.rating, 0);
    const updatedAvg = (sum / allRatings.length).toFixed(1);

    return res.status(200).json({
      message: isNew ? 'Rating submitted successfully!' : 'Rating updated successfully!',
      rating: ratingRecord,
      storeOverallRating: updatedAvg,
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return res.status(500).json({ message: 'Error submitting rating.', error: error.message });
  }
};

module.exports = {
  getStoresForUser,
  submitOrUpdateRating,
};

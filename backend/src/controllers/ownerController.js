const { Store, Rating, User } = require('../models');

// Get Store Owner Dashboard Data
const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

    // Find store owned by this user
    const store = await Store.findOne({
      where: { ownerId },
      include: [
        {
          model: Rating,
          as: 'ratings',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'address'],
            },
          ],
        },
      ],
    });

    if (!store) {
      return res.status(200).json({
        hasStore: false,
        message: 'No store is associated with your account yet.',
        storeName: null,
        averageRating: 'N/A',
        totalRatings: 0,
        ratingsList: [],
      });
    }

    const ratings = store.ratings || [];
    let averageRating = 0;

    if (ratings.length > 0) {
      const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
      averageRating = Number((sum / ratings.length).toFixed(1));
    }

    let ratingsList = ratings.map((r) => ({
      ratingId: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      userId: r.user ? r.user.id : null,
      userName: r.user ? r.user.name : 'Anonymous User',
      userEmail: r.user ? r.user.email : 'N/A',
      userAddress: r.user ? r.user.address : 'N/A',
    }));

    // Sort ratings list
    ratingsList.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder.toUpperCase() === 'DESC' ? 1 : -1;
      if (valA > valB) return sortOrder.toUpperCase() === 'DESC' ? -1 : 1;
      return 0;
    });

    return res.status(200).json({
      hasStore: true,
      storeId: store.id,
      storeName: store.name,
      storeAddress: store.address,
      storeEmail: store.email,
      averageRating: averageRating > 0 ? averageRating : 'No ratings yet',
      totalRatings: ratings.length,
      ratingsList,
    });
  } catch (error) {
    console.error('Error fetching owner dashboard:', error);
    return res.status(500).json({ message: 'Error fetching owner dashboard.', error: error.message });
  }
};

module.exports = {
  getOwnerDashboard,
};

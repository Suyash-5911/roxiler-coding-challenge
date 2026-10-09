const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const { User, Store, Rating } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🔄 Syncing database tables...');
    await sequelize.sync({ force: true });
    console.log('✅ Database tables synchronized.');

    const defaultPasswordHash = await bcrypt.hash('Admin@1234', 10);
    const ownerPasswordHash = await bcrypt.hash('Owner@1234', 10);
    const userPasswordHash = await bcrypt.hash('User@12345', 10);

    console.log('🌱 Seeding users...');

    // 1. System Admin
    const admin = await User.create({
      name: 'System Administrator Account', // 28 chars
      email: 'admin@storeplatform.com',
      password: defaultPasswordHash,
      address: '100 Administrative Plaza, Central District, Suite 500, Metropia 90001',
      role: 'SYSTEM_ADMIN',
    });

    // 2. Store Owners
    const owner1 = await User.create({
      name: 'Alexander Michael Sterling', // 26 chars
      email: 'owner.sterling@techhub.com',
      password: ownerPasswordHash,
      address: '450 Tech Innovation Highway, Suite 10, Silicon Valley, CA 94025',
      role: 'STORE_OWNER',
    });

    const owner2 = await User.create({
      name: 'Eleanor Grace Vance Owner', // 26 chars
      email: 'owner.vance@bookhaven.com',
      password: ownerPasswordHash,
      address: '782 Grand Avenue Literature Boulevard, New York, NY 10001',
      role: 'STORE_OWNER',
    });

    const owner3 = await User.create({
      name: 'Marcus Aurelius Vance Owner', // 28 chars
      email: 'owner.marcus@gourmet.com',
      password: ownerPasswordHash,
      address: '12 Culinary Square Expressway, Culinary Bay, CA 94107',
      role: 'STORE_OWNER',
    });

    // 3. Normal Users
    const user1 = await User.create({
      name: 'Johnathan Christopher Doe', // 26 chars
      email: 'johnathan.doe@example.com',
      password: userPasswordHash,
      address: '234 Elmwood Avenue Park, Apartment 4B, Springfield, IL 62701',
      role: 'NORMAL_USER',
    });

    const user2 = await User.create({
      name: 'Samantha Elizabeth Miller', // 26 chars
      email: 'samantha.miller@example.com',
      password: userPasswordHash,
      address: '891 Oakridge Terrace Drive, Building C, Austin, TX 78701',
      role: 'NORMAL_USER',
    });

    const user3 = await User.create({
      name: 'David Franklin Robertson Jr', // 27 chars
      email: 'david.robertson@example.com',
      password: userPasswordHash,
      address: '512 Sunset Boulevard West, Floor 12, Seattle, WA 98101',
      role: 'NORMAL_USER',
    });

    console.log('🌱 Seeding stores...');

    // Stores (names 20-60 chars)
    const store1 = await Store.create({
      name: 'Apex Electronics Superstore', // 27 chars
      email: 'support@apexelectronics.com',
      address: '450 Tech Innovation Highway, Suite 10, Silicon Valley, CA 94025',
      ownerId: owner1.id,
    });

    const store2 = await Store.create({
      name: 'The Classic Book Emporium', // 25 chars
      email: 'contact@classicbooks.com',
      address: '782 Grand Avenue Literature Boulevard, New York, NY 10001',
      ownerId: owner2.id,
    });

    const store3 = await Store.create({
      name: 'Gourmet Bistro & Cafe House', // 27 chars
      email: 'info@gourmetbistro.com',
      address: '12 Culinary Square Expressway, Culinary Bay, CA 94107',
      ownerId: owner3.id,
    });

    const store4 = await Store.create({
      name: 'Urban Trends Fashion Outlet', // 27 chars
      email: 'hello@urbantrends.com',
      address: '990 Fashion Marketplace Circle, Chicago, IL 60601',
      ownerId: null, // Unassigned store for testing
    });

    console.log('🌱 Seeding ratings...');

    // Ratings (1 to 5)
    await Rating.create({ userId: user1.id, storeId: store1.id, rating: 5 });
    await Rating.create({ userId: user2.id, storeId: store1.id, rating: 4 });
    await Rating.create({ userId: user3.id, storeId: store1.id, rating: 5 });

    await Rating.create({ userId: user1.id, storeId: store2.id, rating: 5 });
    await Rating.create({ userId: user2.id, storeId: store2.id, rating: 3 });

    await Rating.create({ userId: user3.id, storeId: store3.id, rating: 4 });

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
};

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = seedDatabase;

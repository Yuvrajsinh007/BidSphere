const mongoose = require('mongoose');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const setupDatabase = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Created uploads directory');
    } else {
      console.log('✅ Uploads directory already exists');
    }

    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@auction.com' });
    
    if (adminExists) {
      console.log('✅ Admin user already exists');
    } else {
      // Create admin user
      const adminUser = await User.create({
        name: 'Admin',
        email: 'admin@auction.com',
        password: 'admin123',
        role: 'Admin',
        phone: '+1234567890',
        address: 'Admin Address',
        bio: 'System Administrator'
      });
      console.log('✅ Admin user created successfully');
      console.log('📧 Email: admin@auction.com');
      console.log('🔑 Password: admin123');
    }

    // Create some sample users for testing
    const sampleUsers = [
      {
        name: 'John Seller',
        email: 'seller@test.com',
        password: 'seller123',
        role: 'Seller',
        phone: '+1234567891',
        address: 'Seller Address',
        bio: 'Professional seller'
      },
      {
        name: 'Jane Buyer',
        email: 'buyer@test.com',
        password: 'buyer123',
        role: 'Buyer',
        phone: '+1234567892',
        address: 'Buyer Address',
        bio: 'Active bidder'
      }
    ];

    for (const userData of sampleUsers) {
      const userExists = await User.findOne({ email: userData.email });
      if (!userExists) {
        await User.create(userData);
        console.log(`✅ Created ${userData.role} user: ${userData.email}`);
      }
    }

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Default Accounts:');
    console.log('👑 Admin: admin@auction.com / admin123');
    console.log('🏪 Seller: seller@test.com / seller123');
    console.log('🛒 Buyer: buyer@test.com / buyer123');
    console.log('\n⚠️  Remember to change these passwords after first login!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

setupDatabase();

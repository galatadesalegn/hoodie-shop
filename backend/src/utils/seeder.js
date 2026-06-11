import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Hoodie from '../models/Hoodie.js';

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('DB Connected');
};

const seedSuperAdmin = async () => {
  const existing = await User.findOne({ role: 'superadmin' });
  if (existing) {
    console.log('Super admin already exists. Seed credentials are ignored; manage email and password from Admin Settings.');
    return;
  }

  const name = process.env.SUPER_ADMIN_NAME;
  const username = process.env.SUPER_ADMIN_USERNAME;
  const email = process.env.SUPER_ADMIN_EMAIL;
  let password = process.env.SUPER_ADMIN_PASSWORD;

  if (!name || !username || !email) {
    console.error('Missing SUPER_ADMIN_NAME, SUPER_ADMIN_USERNAME or SUPER_ADMIN_EMAIL in environment. These are only required to create the first super admin.');
    return;
  }

  if (!password) {
    // Generate a strong random password if not provided
    const crypto = await import('crypto');
    const buf = crypto.randomBytes(12).toString('base64');
    // Ensure the password contains at least one symbol and one uppercase
    password = `A${buf}#1`;
    console.warn('No SUPER_ADMIN_PASSWORD provided. A strong password was generated for the super admin:');
    console.warn(password);
  }

  await User.create({
    name,
    username,
    email,
    password,
    role: 'superadmin',
    isEmailVerified: true,
    refreshTokens: [],
  });
  console.log('✅ Super Admin created');
};

const seedSampleHoodies = async () => {
  const count = await Hoodie.countDocuments();
  if (count > 0) {
    console.log('Hoodies already seeded');
    return;
  }

  const admin = await User.findOne({ role: 'superadmin' });

  const hoodies = [
    {
      name: 'Urban Shadow Oversized Hoodie',
      brand: 'HoodVault',
      description: 'Premium heavyweight cotton blend oversized hoodie. Perfect for the streets and beyond. Features kangaroo pocket, adjustable drawstring hood, and ribbed cuffs.',
      price: 2500,
      discountPrice: 1999,
      category: 'oversized',
      sizes: [{ size: 'S', stock: 10 }, { size: 'M', stock: 15 }, { size: 'L', stock: 12 }, { size: 'XL', stock: 8 }],
      colors: [{ name: 'Midnight Black', hex: '#1a1a1a' }, { name: 'Arctic White', hex: '#f5f5f5' }],
      images: [{ url: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800', publicId: 'sample1' }],
      featured: true,
      newArrival: true,
      createdBy: admin._id,
    },
    {
      name: 'Street Phantom Zip-Up',
      brand: 'HoodVault',
      description: 'Full-zip premium streetwear hoodie with contrast zipper. Crafted from 400 GSM French terry fabric for supreme comfort.',
      price: 2800,
      category: 'zip-up',
      sizes: [{ size: 'M', stock: 10 }, { size: 'L', stock: 8 }, { size: 'XL', stock: 6 }],
      colors: [{ name: 'Charcoal', hex: '#36454f' }, { name: 'Navy', hex: '#1f3a6e' }],
      images: [{ url: 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800', publicId: 'sample2' }],
      featured: true,
      newArrival: false,
      createdBy: admin._id,
    },
    {
      name: 'Graphic Flame Hoodie',
      brand: 'HoodVault',
      description: 'Bold graphic print hoodie with our signature flame design. Screen-printed with premium inks that last through hundreds of washes.',
      price: 2200,
      category: 'graphic',
      sizes: [{ size: 'S', stock: 5 }, { size: 'M', stock: 12 }, { size: 'L', stock: 10 }],
      colors: [{ name: 'Black', hex: '#000000' }],
      images: [{ url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800', publicId: 'sample3' }],
      featured: false,
      newArrival: true,
      createdBy: admin._id,
    },
  ];

  // Using for...of loop to ensure .save() is called for each document to trigger pre-save middleware (slug generation)
  for (const hoodieData of hoodies) {
    const hoodie = new Hoodie(hoodieData);
    await hoodie.save();
  }
  console.log('✅ Sample hoodies seeded');
};

const run = async () => {
  await connectDB();
  
  // Cleanup partially seeded data to avoid duplicate key errors
  await Hoodie.deleteMany({});
  console.log('🗑️ Cleaned up existing hoodies');

  await seedSuperAdmin();
  await seedSampleHoodies();
  console.log('Seeding complete!');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  let connected = false;

  if (uri) {
    try {
      console.log('Connecting to configured MongoDB...');
      const conn = await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      connected = true;
    } catch (error) {
      console.warn(`Configured MongoDB connection failed (${error.message}).`);
    }
  }

  if (!connected) {
    console.log('Falling back to in-memory MongoDB server for local development...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: { dbName: 'dentalhub' },
      });
      const memoryUri = memoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`In-Memory MongoDB Connected at: ${conn.connection.host}:${conn.connection.port}`);
      connected = true;
    } catch (err) {
      console.error(`Failed to start in-memory MongoDB: ${err.message}`);
      process.exit(1);
    }
  }

  // Auto-seed initial demo data if database is fresh
  try {
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database is empty. Automatically seeding demo data...');
      const seed = require('../seeds/seed');
      await seed();
    }
  } catch (seedErr) {
    console.warn('Seeding check warning:', seedErr.message);
  }
};

module.exports = connectDB;

const mongoose = require('mongoose');

let isConnectedToAtlas = false;
let dbSource = 'Initializing';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const isPlaceholder = !uri || uri.includes('<username>') || uri.includes('<password>');

  if (!isPlaceholder) {
    try {
      console.log('Connecting to MongoDB Atlas at:', uri.replace(/:([^:@]{3,})@/, ':****@'));
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnectedToAtlas = true;
      dbSource = 'MongoDB Atlas';
      console.log(` MongoDB Atlas Connected successfully: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn('⚠️ Could not connect to MongoDB Atlas URI provided:', err.message);
      console.log('Falling back to local in-memory MongoDB so the application remains fully functional...');
    }
  } else {
    console.log('ℹ️ Placeholder detected in server/.env (MONGODB_URI).');
    console.log('Starting MongoDB in-memory server for immediate testing while awaiting your Atlas credentials...');
  }

  // Fallback to MongoMemoryServer
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    isConnectedToAtlas = false;
    dbSource = 'In-Memory MongoDB (Dev Fallback)';
    console.log(` In-Memory MongoDB Connected at: ${memoryUri}`);
    console.log(' Tip: Update server/.env with your real MongoDB Atlas URI anytime to persist to Atlas cloud.');
  } catch (memErr) {
    console.error('❌ Failed to start in-memory MongoDB fallback:', memErr.message);
    process.exit(1);
  }
};

const getDbStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  source: dbSource,
  isAtlas: isConnectedToAtlas,
  host: mongoose.connection.host || 'unknown',
});

module.exports = { connectDB, getDbStatus };

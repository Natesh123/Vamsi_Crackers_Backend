const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDb } = require('./config/db');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes (to allow fetches from Next.js server on port 3000)
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contacts', contactRoutes);

// Simple Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running correctly.' });
});

// System Diagnostics Endpoint
app.get('/api/diagnostics', async (req, res) => {
  try {
    const { getPool } = require('./config/db');
    const pool = getPool();
    // Test the database connection
    await pool.query('SELECT 1');
    res.json({
      dbDriver: 'MySQL (mysql2)',
      dbHost: process.env.DB_HOST || '127.0.0.1',
      dbPort: process.env.DB_PORT || '3306',
      dbName: process.env.DB_NAME || 'crackers_city',
      apiRuntime: 'Node.js (Express)',
      dbStatus: 'Connected',
      storagePath: `MySQL DB '${process.env.DB_NAME || 'crackers_city'}'`
    });
  } catch (error) {
    res.json({
      dbDriver: 'MySQL (mysql2)',
      dbHost: process.env.DB_HOST || '127.0.0.1',
      dbPort: process.env.DB_PORT || '3306',
      dbName: process.env.DB_NAME || 'crackers_city',
      apiRuntime: 'Node.js (Express)',
      dbStatus: 'Disconnected',
      storagePath: `MySQL DB '${process.env.DB_NAME || 'crackers_city'}'`,
      error: error.message
    });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Make io accessible globally or export it. For simplicity, we can set it on the app object.
app.set('io', io);

// Initialize database and start HTTP server
async function startServer() {
  try {
    // Connect to MySQL, create schema, and seed default data
    await initDb();
    
    server.listen(PORT, () => {
      console.log(`=============================================`);
      console.log(`🚀 Express & Socket.io Server is running on port ${PORT}`);
      console.log(`👉 Health Check: http://localhost:${PORT}/health`);
      console.log(`=============================================`);
    });
    
    io.on('connection', (socket) => {
      console.log('A client connected via Socket.io:', socket.id);
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

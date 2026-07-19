const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

let pool;

async function initDb() {
  try {
    const dbName = process.env.DB_NAME || 'crackers_city';
    console.log(`Connecting to MySQL at ${dbConfig.host}:${dbConfig.port}...`);
    
    // 1. Connect without database first to ensure the database exists
    const connection = await mysql.createConnection(dbConfig);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();
    console.log(`Database '${dbName}' verified/created.`);

    // 2. Create the connection pool with database name
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 3. Initialize tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Verified 'categories' table.");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        \`key\` VARCHAR(255) PRIMARY KEY,
        \`value\` TEXT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Verified 'settings' table.");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price INT NOT NULL,
        originalPrice INT NOT NULL,
        image VARCHAR(255) NOT NULL,
        categoryId INT NOT NULL,
        FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Verified 'products' table.");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        customer_city VARCHAR(255) NOT NULL,
        customer_address TEXT NOT NULL,
        total_amount INT NOT NULL,
        total_savings INT NOT NULL,
        items JSON NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Verified 'orders' table.");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Verified 'contacts' table.");

    try {
      await pool.query(`ALTER TABLE products ADD COLUMN discount INT DEFAULT 0;`);
      console.log("Added 'discount' column to products table.");
    } catch (e) {
      // Column already exists
    }

    try {
      await pool.query(`ALTER TABLE products ADD COLUMN apply_discount BOOLEAN DEFAULT TRUE;`);
      console.log("Added 'apply_discount' column to products table.");
    } catch (e) {
      // Column already exists
    }

    try {
      await pool.query(`ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255) DEFAULT '';`);
      console.log("Added 'customer_email' column to orders table.");
    } catch (e) {
      // Column already exists
    }

    try {
      await pool.query(`ALTER TABLE orders ADD COLUMN is_read BOOLEAN DEFAULT FALSE;`);
      console.log("Added 'is_read' column to orders table.");
    } catch (e) {
      // Column already exists
    }

    try {
      await pool.query(`UPDATE products SET discount = ROUND(((originalPrice - price) / originalPrice) * 100) WHERE discount = 0 AND originalPrice > 0;`);
      console.log("Backfilled discount values for existing products.");
    } catch (e) {
      console.error("Backfill failed:", e.message);
    }

    // 4. Seed default data if categories table is empty
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM categories');
    if (rows[0].count === 0) {
      console.log('Categories table is empty. Seeding default data...');
      
      const defaultFilters = ["Sparklers", "Flower Pots", "Ground Chakkars", "Rockets", "Sky Shots", "Garlands"];
      const categoryIds = {};

      for (const filter of defaultFilters) {
        const [result] = await pool.query("INSERT INTO categories (name) VALUES (?)", [filter]);
        categoryIds[filter] = result.insertId;
      }

      const defaultProducts = [
        { name: "7cm Electric Sparklers", category: "Sparklers", price: 120, originalPrice: 250, image: "/assets/images/products/sparklers.png" },
        { name: "10cm Green Sparklers", category: "Sparklers", price: 150, originalPrice: 300, image: "/assets/images/products/sparklers.png" },
        { name: "12cm Red Sparklers", category: "Sparklers", price: 180, originalPrice: 350, image: "/assets/images/products/sparklers.png" },
        { name: "Flower Pot Small", category: "Flower Pots", price: 200, originalPrice: 400, image: "/assets/images/products/flower_pots.png" },
        { name: "Flower Pot Big", category: "Flower Pots", price: 350, originalPrice: 700, image: "/assets/images/products/flower_pots.png" },
        { name: "Flower Pot Special", category: "Flower Pots", price: 500, originalPrice: 900, image: "/assets/images/products/flower_pots.png" },
        { name: "Ground Chakkar Big", category: "Ground Chakkars", price: 220, originalPrice: 450, image: "/assets/images/products/ground_chakkars.png" },
        { name: "Chakkar Deluxe", category: "Ground Chakkars", price: 300, originalPrice: 600, image: "/assets/images/products/ground_chakkars.png" },
        { name: "Spinner Special", category: "Ground Chakkars", price: 380, originalPrice: 750, image: "/assets/images/products/ground_chakkars.png" },
        { name: "Baby Rocket", category: "Rockets", price: 150, originalPrice: 300, image: "/assets/images/products/rockets.png" },
        { name: "Lunik Rocket", category: "Rockets", price: 450, originalPrice: 900, image: "/assets/images/products/rockets.png" },
        { name: "12 Shot Skyout", category: "Sky Shots", price: 850, originalPrice: 1700, image: "/assets/images/products/sky_shots.png" },
        { name: "30 Shot Multi Color", category: "Sky Shots", price: 2500, originalPrice: 5000, image: "/assets/images/products/sky_shots.png" },
        { name: "240 Shot Mega Show", category: "Sky Shots", price: 12000, originalPrice: 24000, image: "/assets/images/products/sky_shots.png" },
        { name: "1000 Wala", category: "Garlands", price: 600, originalPrice: 1200, image: "/assets/images/products/garlands.png" },
        { name: "5000 Wala Giant", category: "Garlands", price: 3500, originalPrice: 7000, image: "/assets/images/products/garlands.png" }
      ];

      for (const prod of defaultProducts) {
        const catId = categoryIds[prod.category];
        if (catId) {
          const discountVal = prod.originalPrice > 0 ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100) : 0;
          await pool.query(
            "INSERT INTO products (name, price, originalPrice, discount, image, categoryId) VALUES (?, ?, ?, ?, ?, ?)",
            [prod.name, prod.price, prod.originalPrice, discountVal, prod.image, catId]
          );
        }
      }
      console.log('Seeding completed successfully!');
    }

  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDb() first.');
  }
  return pool;
}

module.exports = {
  initDb,
  getPool
};

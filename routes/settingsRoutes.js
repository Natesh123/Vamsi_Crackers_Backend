const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getPool } = require('../config/db');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, `price_list_${Date.now()}_${sanitizedName}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: Only PDFs are allowed!"));
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Get Price List URL
router.get('/price-list', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT value FROM settings WHERE `key` = ?', ['price_list_url']);
    if (rows.length > 0) {
      return res.json({ url: rows[0].value });
    }
    return res.json({ url: "" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload Price List PDF
router.post('/price-list/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const filename = req.file.filename;
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    const pool = getPool();

    // Insert or Update the price_list_url key in settings table
    await pool.query(
      'INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
      ['price_list_url', fileUrl, fileUrl]
    );

    res.json({ url: fileUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Price List PDF
router.delete('/price-list', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM settings WHERE `key` = ?', ['price_list_url']);
    res.json({ message: "Price list deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Banner Text
router.get('/banner-text/get', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT value FROM settings WHERE `key` = ?', ['banner_text']);
    if (rows.length > 0) {
      return res.json({ text: rows[0].value });
    }
    return res.json({ text: "" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Banner Text
router.post('/banner-text/update', express.json(), async (req, res) => {
  try {
    const pool = getPool();
    const { text } = req.body;
    await pool.query(
      'INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
      ['banner_text', text, text]
    );
    res.json({ message: "Banner text updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Banner Images
router.get('/banner-images/get', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT value FROM settings WHERE `key` = ?', ['banner_images']);
    if (rows.length > 0) {
      try {
        const images = JSON.parse(rows[0].value);
        return res.json({ images });
      } catch (e) {
        return res.json({ images: [] });
      }
    }
    return res.json({ images: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Banner Images
router.post('/banner-images/update', express.json(), async (req, res) => {
  try {
    const pool = getPool();
    const { images } = req.body; // Expects an array of image objects/strings
    const valueStr = JSON.stringify(images || []);
    await pool.query(
      'INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
      ['banner_images', valueStr, valueStr]
    );
    res.json({ message: "Banner images updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Min Order Value
router.get('/min-order-value/get', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT value FROM settings WHERE `key` = ?', ['min_order_value']);
    if (rows.length > 0) {
      return res.json({ value: rows[0].value });
    }
    return res.json({ value: "0" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Min Order Value
router.post('/min-order-value/update', express.json(), async (req, res) => {
  try {
    const pool = getPool();
    const { value } = req.body;
    await pool.query(
      'INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
      ['min_order_value', String(value), String(value)]
    );
    res.json({ message: "Min order value updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

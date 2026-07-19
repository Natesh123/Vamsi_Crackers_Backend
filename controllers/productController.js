const { getPool } = require('../config/db');

exports.getProducts = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.price, p.originalPrice, p.discount, p.apply_discount, p.image, p.categoryId, c.name as category
      FROM products p
      JOIN categories c ON p.categoryId = c.id
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.applyGlobalDiscount = async (req, res) => {
  try {
    const pool = getPool();
    const { discountPercentage } = req.body;

    const discount = parseInt(discountPercentage, 10);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      return res.status(400).json({ error: "Valid discount percentage (0-100) is required" });
    }

    // Update all products WHERE apply_discount = 1
    const [result] = await pool.query(`
      UPDATE products 
      SET price = ROUND(originalPrice - (originalPrice * ? / 100)),
          discount = ?
      WHERE apply_discount = 1
    `, [discount, discount]);

    res.json({ success: true, message: `Applied ${discount}% discount to all products`, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const pool = getPool();
    const { name, price, originalPrice, discount, image, categoryId, applyDiscount } = req.body;

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Product name is required" });
    }
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ error: "Valid price is required" });
    }
    if (originalPrice === undefined || isNaN(Number(originalPrice)) || Number(originalPrice) < 0) {
      return res.status(400).json({ error: "Valid original price is required" });
    }
    const shouldApplyDiscount = applyDiscount !== undefined ? Boolean(applyDiscount) : true;
    let discountVal = discount !== undefined ? Math.round(Number(discount)) : 0;
    
    if (!shouldApplyDiscount) {
      discountVal = 0; // Force 0 if discount is disabled for this product
    } else if (isNaN(discountVal) || discountVal < 0 || discountVal > 100) {
      return res.status(400).json({ error: "Discount must be between 0 and 100" });
    }
    if (!image || image.trim() === "") {
      return res.status(400).json({ error: "Product image is required" });
    }
    if (!categoryId || isNaN(Number(categoryId))) {
      return res.status(400).json({ error: "Valid category is required" });
    }

    const [result] = await pool.query(
      `INSERT INTO products (name, price, originalPrice, discount, apply_discount, image, categoryId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        Math.round(Number(price)),
        Math.round(Number(originalPrice)),
        discountVal,
        shouldApplyDiscount,
        image.trim(),
        Number(categoryId)
      ]
    );

    const newProductId = result.insertId;

    // Fetch the inserted product with its category details
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.price, p.originalPrice, p.discount, p.apply_discount, p.image, p.categoryId, c.name as category
      FROM products p
      JOIN categories c ON p.categoryId = c.id
      WHERE p.id = ?
    `, [newProductId]);

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { name, price, originalPrice, discount, image, categoryId, applyDiscount } = req.body;

    const productId = parseInt(id);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Product name is required" });
    }
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ error: "Valid price is required" });
    }
    if (originalPrice === undefined || isNaN(Number(originalPrice)) || Number(originalPrice) < 0) {
      return res.status(400).json({ error: "Valid original price is required" });
    }
    const shouldApplyDiscount = applyDiscount !== undefined ? Boolean(applyDiscount) : true;
    let discountVal = discount !== undefined ? Math.round(Number(discount)) : 0;
    
    if (!shouldApplyDiscount) {
      discountVal = 0; // Force 0 if discount is disabled
    } else if (isNaN(discountVal) || discountVal < 0 || discountVal > 100) {
      return res.status(400).json({ error: "Discount must be between 0 and 100" });
    }
    if (!image || image.trim() === "") {
      return res.status(400).json({ error: "Product image is required" });
    }
    if (!categoryId || isNaN(Number(categoryId))) {
      return res.status(400).json({ error: "Valid category is required" });
    }

    const [result] = await pool.query(
      `UPDATE products 
       SET name = ?, price = ?, originalPrice = ?, discount = ?, apply_discount = ?, image = ?, categoryId = ? 
       WHERE id = ?`,
      [
        name.trim(),
        Math.round(Number(price)),
        Math.round(Number(originalPrice)),
        discountVal,
        shouldApplyDiscount,
        image.trim(),
        Number(categoryId),
        productId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Fetch the updated product with its category details
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.price, p.originalPrice, p.discount, p.apply_discount, p.image, p.categoryId, c.name as category
      FROM products p
      JOIN categories c ON p.categoryId = c.id
      WHERE p.id = ?
    `, [productId]);

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;

    const productId = parseInt(id);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [productId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

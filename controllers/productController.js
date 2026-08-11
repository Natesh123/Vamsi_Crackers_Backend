const { getPool } = require('../config/db');

exports.getProducts = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.price, p.originalPrice, p.discount, p.apply_discount, p.is_active, p.image, p.categoryId, p.sort_order, c.name as category
      FROM products p
      JOIN categories c ON p.categoryId = c.id
      ORDER BY CASE WHEN p.sort_order = 0 THEN 1 ELSE 0 END ASC, p.sort_order ASC, p.id ASC
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
    const { name, price, originalPrice, discount, image, categoryId, applyDiscount, isActive, sortOrder } = req.body;

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

    if (!categoryId || isNaN(Number(categoryId))) {
      return res.status(400).json({ error: "Valid category is required" });
    }

    const trimmedName = name.trim();
    const [existingProduct] = await pool.query("SELECT id FROM products WHERE name = ?", [trimmedName]);
    if (existingProduct.length > 0) {
      return res.status(400).json({ error: "A product with this name already exists." });
    }

    const shouldBeActive = isActive !== undefined ? Boolean(isActive) : true;
    const sortVal = sortOrder !== undefined ? parseInt(sortOrder) || 0 : 0;

    const [result] = await pool.query(
      `INSERT INTO products (name, price, originalPrice, discount, apply_discount, is_active, image, categoryId, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        Math.round(Number(price)),
        Math.round(Number(originalPrice)),
        discountVal,
        shouldApplyDiscount,
        shouldBeActive,
        (image || "").trim(),
        Number(categoryId),
        sortVal
      ]
    );

    const newProductId = result.insertId;

    // Fetch the inserted product with its category details
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.price, p.originalPrice, p.discount, p.apply_discount, p.is_active, p.image, p.categoryId, p.sort_order, c.name as category
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
    const { name, price, originalPrice, discount, image, categoryId, applyDiscount, isActive, sortOrder } = req.body;

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

    if (!categoryId || isNaN(Number(categoryId))) {
      return res.status(400).json({ error: "Valid category is required" });
    }

    const shouldBeActive = isActive !== undefined ? Boolean(isActive) : true;
    const sortVal = sortOrder !== undefined ? parseInt(sortOrder) || 0 : 0;

    const [result] = await pool.query(
      `UPDATE products 
       SET name = ?, price = ?, originalPrice = ?, discount = ?, apply_discount = ?, is_active = ?, image = ?, categoryId = ?, sort_order = ?
       WHERE id = ?`,
      [
        name.trim(),
        Math.round(Number(price)),
        Math.round(Number(originalPrice)),
        discountVal,
        shouldApplyDiscount,
        shouldBeActive,
        (image || "").trim(),
        Number(categoryId),
        sortVal,
        productId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Fetch the updated product with its category details
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.price, p.originalPrice, p.discount, p.apply_discount, p.is_active, p.image, p.categoryId, p.sort_order, c.name as category
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

exports.deleteMultipleProducts = async (req, res) => {
  try {
    const pool = getPool();
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "An array of product IDs is required" });
    }

    // Ensure all IDs are valid numbers
    const validIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));
    if (validIds.length === 0) {
      return res.status(400).json({ error: "Invalid product IDs provided" });
    }

    // Create placeholders
    const placeholders = validIds.map(() => '?').join(', ');
    const [result] = await pool.query(`DELETE FROM products WHERE id IN (${placeholders})`, validIds);

    res.json({ message: `Successfully deleted ${result.affectedRows} products`, affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggleApplyDiscount = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { applyDiscount } = req.body;

    const productId = parseInt(id);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const val = applyDiscount ? 1 : 0;
    
    if (val === 0) {
      await pool.query(
        `UPDATE products SET apply_discount = 0, price = originalPrice, discount = 0 WHERE id = ?`,
        [productId]
      );
    } else {
      await pool.query(
        `UPDATE products SET apply_discount = 1 WHERE id = ?`,
        [productId]
      );
    }

    res.json({ success: true, message: "Apply discount toggled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.bulkCreateProducts = async (req, res) => {
  try {
    const pool = getPool();
    const products = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "An array of products is required" });
    }

    let addedCount = 0;
    let errorCount = 0;
    let errors = [];

    // Fetch all categories first to minimize queries
    const [existingCategories] = await pool.query("SELECT id, name FROM categories");
    const categoryMap = new Map();
    existingCategories.forEach(cat => categoryMap.set(cat.name.toLowerCase(), cat.id));

    // Fetch all existing product names to avoid duplicates
    const [existingProducts] = await pool.query("SELECT name FROM products");
    const productNameSet = new Set();
    existingProducts.forEach(prod => productNameSet.add(prod.name.trim().toLowerCase()));

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      try {
        const name = p["Product Name"] || p.name || p.Name;
        const catName = p["Category"] || p.category || p.Category;
        const originalPrice = parseFloat(p["Original Price"] || p.originalPrice || p.OriginalPrice);
        const image = p["Image Source"] || p.image || p.Image || "";
        const sortOrder = parseInt(p["Sort Order"] || p.sort_order || p.sortOrder) || 0;
        
        let applyDiscountStr = String(p["Global Discount"] || p.applyDiscount || "Yes").toLowerCase();
        const applyDiscount = applyDiscountStr === "yes" || applyDiscountStr === "true" || applyDiscountStr === "1";

        let statusStr = String(p["Status"] || p.isActive || p.is_active || "Active").toLowerCase();
        const isActive = statusStr === "active" || statusStr === "true" || statusStr === "1" || statusStr === "yes";

        // Handle Discount Percentage and Offer Price logic
        let offerPriceRaw = p["Offer Price"] || p.offerPrice || p.OfferPrice || p.price || p.Price;
        let discountPctRaw = p["Discount Percentage"] || p["Discount %"] || p.discount;
        
        let offerPrice;
        let discountPct = 0;

        if (offerPriceRaw !== undefined && offerPriceRaw !== "") {
          offerPrice = parseFloat(offerPriceRaw);
        }

        if (discountPctRaw !== undefined && discountPctRaw !== "") {
          discountPct = parseFloat(discountPctRaw);
        }

        // If Offer Price is not provided but Discount Percentage is provided, calculate Offer Price
        if (offerPrice === undefined && discountPct > 0 && originalPrice > 0) {
          offerPrice = originalPrice - (originalPrice * discountPct / 100);
        } else if (offerPrice === undefined) {
          offerPrice = originalPrice; // fallback
        }

        if (!name || isNaN(originalPrice) || isNaN(offerPrice) || !catName) {
          throw new Error("Missing or invalid required fields (Name, Category, Original Price, Offer Price)");
        }

        const trimmedName = name.trim();
        const isExisting = productNameSet.has(trimmedName.toLowerCase());
        
        let categoryId;
        const cleanCatName = catName.trim();
        if (categoryMap.has(cleanCatName.toLowerCase())) {
          categoryId = categoryMap.get(cleanCatName.toLowerCase());
        } else {
          // Create category
          const [catResult] = await pool.query("INSERT INTO categories (name) VALUES (?)", [cleanCatName]);
          categoryId = catResult.insertId;
          categoryMap.set(cleanCatName.toLowerCase(), categoryId);
        }

        let discountVal = 0;
        if (discountPct > 0) {
          discountVal = Math.round(discountPct);
        } else if (applyDiscount && originalPrice > 0 && originalPrice >= offerPrice) {
          discountVal = Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
        }

        if (isExisting) {
          // Update existing product
          await pool.query(
            `UPDATE products SET price = ?, originalPrice = ?, discount = ?, apply_discount = ?, is_active = ?, image = IF(? = '', image, ?), categoryId = ?, sort_order = ? WHERE LOWER(name) = ?`,
            [
              Math.round(offerPrice),
              Math.round(originalPrice),
              discountVal,
              applyDiscount,
              isActive,
              image.trim(),
              image.trim(),
              categoryId,
              sortOrder,
              trimmedName.toLowerCase()
            ]
          );
        } else {
          // Insert new product
          await pool.query(
            `INSERT INTO products (name, price, originalPrice, discount, apply_discount, is_active, image, categoryId, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              trimmedName,
              Math.round(offerPrice),
              Math.round(originalPrice),
              discountVal,
              applyDiscount,
              isActive,
              image.trim(),
              categoryId,
              sortOrder
            ]
          );
          productNameSet.add(trimmedName.toLowerCase()); // prevent duplicate in same file
        }
        
        addedCount++;
      } catch (err) {
        errorCount++;
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    res.status(201).json({
      success: true,
      message: `Bulk upload complete. Processed ${addedCount} products. Failed: ${errorCount}`,
      addedCount,
      errorCount,
      errors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

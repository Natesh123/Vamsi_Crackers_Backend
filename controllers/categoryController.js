const { getPool } = require('../config/db');

exports.getCategories = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM categories ORDER BY name ASC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const pool = getPool();
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Category name is required" });
    }

    const trimmedName = name.trim();

    const [result] = await pool.query("INSERT INTO categories (name) VALUES (?)", [trimmedName]);
    const newCategory = { id: result.insertId, name: trimmedName };

    res.status(201).json(newCategory);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || error.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "Category name already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Category name is required" });
    }

    const trimmedName = name.trim();
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const [result] = await pool.query(
      "UPDATE categories SET name = ? WHERE id = ?",
      [trimmedName, categoryId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ id: categoryId, name: trimmedName });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || error.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "Category name already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;

    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    // ON DELETE CASCADE automatically deletes associated products
    const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [categoryId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

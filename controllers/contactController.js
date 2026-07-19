const { getPool } = require('../config/db');

exports.getContacts = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM contacts ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createContact = async (req, res) => {
  try {
    const pool = getPool();
    const { name, phone, message } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!phone || phone.trim() === "") {
      return res.status(400).json({ error: "Phone number is required" });
    }
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();

    const [result] = await pool.query(
      "INSERT INTO contacts (name, phone, message) VALUES (?, ?, ?)",
      [trimmedName, trimmedPhone, trimmedMessage]
    );

    const newContact = {
      id: result.insertId,
      name: trimmedName,
      phone: trimmedPhone,
      message: trimmedMessage,
      is_read: 0,
      created_at: new Date()
    };

    // Emit socket event for new contact notification if Socket.io is configured
    const io = req.app.get('io');
    if (io) {
      io.emit('new-contact', newContact);
    }

    res.status(201).json({ success: true, contact: newContact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markContactAsRead = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;

    const contactId = parseInt(id);
    if (isNaN(contactId)) {
      return res.status(400).json({ error: "Invalid contact ID" });
    }

    const [result] = await pool.query(
      "UPDATE contacts SET is_read = TRUE WHERE id = ?",
      [contactId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Contact message not found" });
    }

    res.json({ message: "Contact message marked as read successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAllContactsAsRead = async (req, res) => {
  try {
    const pool = getPool();
    await pool.query("UPDATE contacts SET is_read = TRUE");
    res.json({ message: "All contact messages marked as read successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;

    const contactId = parseInt(id);
    if (isNaN(contactId)) {
      return res.status(400).json({ error: "Invalid contact ID" });
    }

    const [result] = await pool.query("DELETE FROM contacts WHERE id = ?", [contactId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Contact message not found" });
    }

    res.json({ message: "Contact message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

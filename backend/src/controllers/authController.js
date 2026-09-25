const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error', stack: error.stack });
  }
};

const updateCredentials = async (req, res) => {
  try {
    const { email, password } = req.body;
    let query = '';
    let params = [];

    if (email && password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = 'UPDATE admins SET email = ?, password = ? WHERE id = ?';
      params = [email, hashedPassword, req.admin.id];
    } else if (email) {
      query = 'UPDATE admins SET email = ? WHERE id = ?';
      params = [email, req.admin.id];
    } else if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = 'UPDATE admins SET password = ? WHERE id = ?';
      params = [hashedPassword, req.admin.id];
    } else {
      return res.status(400).json({ message: 'No updates provided' });
    }

    await pool.query(query, params);
    res.json({ message: 'Credentials updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, updateCredentials };

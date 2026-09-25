const pool = require('../config/db');

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        const imageUrl = `/uploads/${req.file.filename}`;
        const title = req.body.title || '';
        
        const [result] = await pool.query(
            'INSERT INTO gallery (image_url, title) VALUES (?, ?)',
            [imageUrl, title]
        );
        
        res.status(201).json({ id: result.insertId, image_url: imageUrl, title });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
};

exports.getGallery = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM gallery ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching gallery', error: error.message });
    }
};

exports.deleteImage = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM gallery WHERE id = ?', [id]);
        res.status(200).json({ message: 'Image deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting image', error: error.message });
    }
};

// controllers/imageController.js
const Image = require('../models/Image');
const fs = require('fs').promises;
const path = require('path');

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const image = new Image({
            name: req.body.name || req.file.originalname,
            originalName: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            mimeType: req.file.mimetype,
            folder: req.body.folder || null,
            user: req.userData.userId
        });

        await image.save();
        res.status(201).json(image);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading image' });
    }
};

exports.deleteImage = async (req, res) => {
    try {
        const image = await Image.findOne({
            _id: req.params.id,
            user: req.userData.userId
        });

        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Delete the file from the filesystem
        try {
            await fs.unlink(path.join(__dirname, '..', image.path));
        } catch (err) {
            console.error('Error deleting file:', err);
            // Continue even if file deletion fails
        }

        // Delete the image document from the database
        await image.deleteOne();
        
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Error deleting image' });
    }
};

exports.searchImages = async (req, res) => {
    try {
        const { q } = req.query;
        const images = await Image.find({
            user: req.userData.userId,
            name: { $regex: q, $options: 'i' }
        });

        res.json(images);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Error searching images' });
    }
};
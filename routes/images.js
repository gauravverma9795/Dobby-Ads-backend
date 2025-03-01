// routes/images.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const imageController = require('../controllers/imageController');

// Apply auth middleware to all routes
router.use(auth);

// Route handlers
router.post('/', upload.single('image'), imageController.uploadImage);
router.delete('/:id', imageController.deleteImage);
router.get('/search', imageController.searchImages);

module.exports = router;
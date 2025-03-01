// routes/folders.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const folderController = require('../controllers/folderController');

// Apply auth middleware to all routes
router.use(auth);

// Route handlers
router.post('/', folderController.createFolder);
router.get('/:id?', folderController.getFolderContents);
router.delete('/:id', folderController.deleteFolder);
// routes/folders.js
router.get('/path/:id', folderController.getFolderPath);

module.exports = router;
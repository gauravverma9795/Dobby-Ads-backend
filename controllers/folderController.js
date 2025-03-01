// controllers/folderController.js
const Folder = require('../models/Folder');
const Image = require('../models/Image');

exports.createFolder = async (req, res) => {
    try {
        const { name, parent } = req.body;

        // Validate folder name
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Folder name is required' });
        }

        // Create folder path
        let path = name;
        if (parent) {
            const parentFolder = await Folder.findOne({
                _id: parent,
                user: req.userData.userId
            });
            if (!parentFolder) {
                return res.status(404).json({ message: 'Parent folder not found' });
            }
            path = `${parentFolder.path}/${name}`;
        }

        // Create new folder
        const folder = new Folder({
            name: name.trim(),
            path,
            parent,
            user: req.userData.userId
        });

        await folder.save();
        res.status(201).json(folder);
    } catch (error) {
        console.error('Create folder error:', error);
        res.status(500).json({ message: 'Error creating folder' });
    }
};

exports.getFolderContents = async (req, res) => {
    try {
        const folderId = req.params.id || null;

        // Get folders
        const folders = await Folder.find({
            user: req.userData.userId,
            parent: folderId
        }).sort({ name: 1 });

        // Get images
        const images = await Image.find({
            user: req.userData.userId,
            folder: folderId
        }).sort({ createdAt: -1 });

        res.json({ folders, images });
    } catch (error) {
        console.error('Get folder contents error:', error);
        res.status(500).json({ message: 'Error getting folder contents' });
    }
};

exports.deleteFolder = async (req, res) => {
    try {
        const folder = await Folder.findOne({
            _id: req.params.id,
            user: req.userData.userId
        });

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // Find all subfolders
        const subfolders = await Folder.find({
            path: { $regex: `^${folder.path}/` },
            user: req.userData.userId
        });

        // Get all folder IDs including current folder and subfolders
        const folderIds = [folder._id, ...subfolders.map(f => f._id)];

        // Delete all images in these folders
        await Image.deleteMany({
            folder: { $in: folderIds }
        });

        // Delete all folders
        await Folder.deleteMany({
            _id: { $in: folderIds }
        });

        res.json({ message: 'Folder deleted successfully' });
    } catch (error) {
        console.error('Delete folder error:', error);
        res.status(500).json({ message: 'Error deleting folder' });
    }
};
// controllers/folderController.js
// Add this new method
exports.getFolderPath = async (req, res) => {
    try {
        const folderId = req.params.id;
        const path = [];
        let currentFolder = await Folder.findOne({
            _id: folderId,
            user: req.userData.userId
        });

        while (currentFolder) {
            path.unshift(currentFolder);
            currentFolder = currentFolder.parent ? 
                await Folder.findOne({
                    _id: currentFolder.parent,
                    user: req.userData.userId
                }) : null;
        }

        res.json(path);
    } catch (error) {
        console.error('Get folder path error:', error);
        res.status(500).json({ message: 'Error getting folder path' });
    }
};
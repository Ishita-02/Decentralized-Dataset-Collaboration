const { Router } = require('express');
const UserController = require('../controllers/userController.js');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router.post("/uploadDataset", upload.single('file'), UserController.uploadDataset.bind(UserController));
router.get("/getDatasets", UserController.getDatasets.bind(UserController))

module.exports = router;

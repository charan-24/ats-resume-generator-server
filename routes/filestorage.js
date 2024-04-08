const filestorageController = require('../controllers/fileStorageController');
const exp = require('express');
const router = exp.Router();
const multer = require('multer');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage });

router.post('/storeresume', upload.single("resume") ,filestorageController.storeResume);
router.get('/getResume',filestorageController.getResume);

module.exports = router;
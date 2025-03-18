const exp = require('express');
const router = exp.Router();
const pfpController = require('../controllers/pfpController');
const multer  = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post('/uploadPfp/:userid',upload.single('image'),pfpController.uploadPfp);
router.get('/getPfp/:userid',pfpController.getPfp);

module.exports = router;
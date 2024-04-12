const resumeController = require('../controllers/resumeController');
const exp = require('express');
const router = exp.Router();

router.post('/generateResume',resumeController.generateResume);
router.post('/jsonToPdf',resumeController.jsonToPdf);

module.exports = router;


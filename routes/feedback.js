const exp = require('express');
const router = exp.Router();
const feedbackController = require('../controllers/feedbackController');
const multer  = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post('/submitFeedback',feedbackController.submitFeedback);
router.get('/displayFeedbacks',feedbackController.displayFeedbacks);
router.post('/changeStatus',feedbackController.changeStatus);
router.post('/uploadFeedbackScreenshot/:feedbackId',upload.single('feedbackScreenshot'),feedbackController.uploadFeedbackScreenshot);
router.get('/getFeedbacks',feedbackController.getFeedbacks);
router.get('/getFeedbackScreenshot/:feedbackId',feedbackController.getFeedbackScreenshot);

module.exports = router;
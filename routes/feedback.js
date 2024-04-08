const exp = require('express');
const router = exp.Router();
const feedbackController = require('../controllers/feedbackController');

router.post('/submitFeedback',feedbackController.submitFeedback);
router.get('/displayFeedbacks',feedbackController.displayFeedbacks);

module.exports = router;
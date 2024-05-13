const exp = require('express');
const router = exp.Router();
const emailController = require('../controllers/emailController');

router.post('/sendWelcomeMail',emailController.sendWelcomeMail);
router.post('/sendWelcomeBackMail',emailController.sendWelcomeBackMail);
router.post('/sendResetPasswordMail',emailController.sendResetPasswordMail);
router.post('/sendPaymentConfirmMail',emailController.sendPaymentConfirmMail);
router.post('/sendResumeRequestMail',emailController.sendResumeRequestMail);
router.post('/sendResumeDownloadMail',emailController.sendResumeDownloadMail);
router.post('/sendFeedbackMail',emailController.sendFeedbackMail);

module.exports = router;
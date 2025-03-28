const exp = require('express');
const router = exp.Router();
const emailController = require('../controllers/emailController');
const jobSchedulingController = require('../controllers/jobSchedulingController');

router.post('/sendWelcomeMail',emailController.sendWelcomeMail);
router.post('/sendWelcomeBackMail',emailController.sendWelcomeBackMail);
router.post('/sendResetPasswordMail',emailController.sendResetPasswordMail);
router.post('/sendPaymentConfirmMail',emailController.sendPaymentConfirmMail);
router.post('/sendResumeRequestMail',emailController.sendResumeRequestMail);
router.post('/sendResumeDownloadMail',emailController.sendResumeDownloadMail);
router.post('/sendFeedbackMail',emailController.sendFeedbackMail);
router.post('/sendJobAlertMails',emailController.sendJobAlertMails);
router.post('/sendEventWinnerMail',emailController.sendEventWinnerMail);
router.delete('/removeJobAlertUsers',jobSchedulingController.removeJobAlertUsers);

module.exports = router;
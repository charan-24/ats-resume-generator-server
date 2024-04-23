const exp = require('express');
const router = exp.Router();
const emailController = require('../controllers/emailController');

router.get('/sendWelcomeMail',emailController.sendWelcomeMail);
router.post('/sendWelcomeBackMail',emailController.sendWelcomeBackMail);
router.post('/sendResetPasswordMail',emailController.sendResetPasswordMail);

module.exports = router;
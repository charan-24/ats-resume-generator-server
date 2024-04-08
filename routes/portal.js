const exp = require('express');
const router = exp.Router();
const emailController = require('../controllers/emailController');

router.get('/sendWelcomeMail',emailController.sendWelcomeMail);

module.exports = router;
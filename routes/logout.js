const exp = require('express');
const router = exp.Router();
const logoutController = require('../controllers/logoutController');

router.get('/',logoutController.handleLogout);

module.exports = router;
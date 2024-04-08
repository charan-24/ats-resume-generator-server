const exp = require('express');
const router = exp.Router();
const hrController = require('../controllers/hrController');

router.post('/hrRegister',hrController.hrRegister);
router.post('/hrLogin',hrController.hrLogin);

module.exports = router;

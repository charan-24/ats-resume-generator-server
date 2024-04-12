const exp = require('express');
const router = exp.Router();
const tpoController = require('../controllers/tpoController');

router.post('/tpoRegister',tpoController.tpoRegister);
router.post('/tpoLogin',tpoController.tpoLogin);

module.exports = router;

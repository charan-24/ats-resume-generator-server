const exp = require('express');
const router = exp.Router();
const tpoController = require('../controllers/tpoController');

router.post('/tpoRegister',tpoController.tpoRegister);
router.post('/tpoLogin',tpoController.tpoLogin);
router.get('/getResumesOfCollege/:college_id',tpoController.getResumesOfCollege);

module.exports = router;

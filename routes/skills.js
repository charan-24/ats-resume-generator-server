const exp = require('express');
const router = exp.Router();
const skillsController = require('../controllers/skillsController');

router.get('/getTrainings',skillsController.getTrainings);
router.get('/getCourses',skillsController.getCourses);

module.exports = router;

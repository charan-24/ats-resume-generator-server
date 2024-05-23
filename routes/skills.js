const exp = require('express');
const router = exp.Router();
const skillsController = require('../controllers/skillsController');

router.get('/getTrainings',skillsController.getTrainings);
router.get('/getCourses',skillsController.getCourses);
router.get('/getThumbnail/:courseId',skillsController.getThumbnail);
router.get('/getUserTrainings/:userId',skillsController.getUserTrainings);
router.get('/getWorkshops',skillsController.getWorkshops);
router.post('/editTraining',skillsController.editTraining);
router.delete('/deleteTraining/:trainingId',skillsController.deleteTraining);
router.post('/editCourse',skillsController.editCourse);
router.delete('/deleteCourse/:courseId',skillsController.deleteCourse);
router.post('/editWorkshop',skillsController.editWorkshop);
router.delete('/deleteWorkshop/:workshopId',skillsController.deleteWorkshop);

module.exports = router;

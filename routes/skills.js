const exp = require('express');
const router = exp.Router();
const skillsController = require('../controllers/skillsController');
const multer  = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.get('/getTrainings',skillsController.getTrainings);
router.get('/getCourses',skillsController.getCourses);
router.get('/getThumbnail/:courseId',skillsController.getThumbnail);
router.get('/getUserTrainings/:userId',skillsController.getUserTrainings);
router.get('/getWorkshops',skillsController.getWorkshops);
router.get('/getTrainingRegisteredUsers',skillsController.getTrainingRegisteredUsers);
router.post('/editTraining',skillsController.editTraining);
router.delete('/deleteTraining/:trainingId',skillsController.deleteTraining);
router.post('/editCourse',upload.single('thumbnail'),skillsController.editCourse);
router.delete('/deleteCourse/:courseId',skillsController.deleteCourse);
router.post('/editWorkshop',skillsController.editWorkshop);
router.delete('/deleteWorkshop/:workshopId',skillsController.deleteWorkshop);



module.exports = router;

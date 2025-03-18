const exp = require('express');
const router = exp.Router();
const adminController = require('../controllers/adminController');
const verifyJWT = require('../middlewares/verifyJWT');
const multer  = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })



router.post('/adminRegister',adminController.adminRegister);
router.post('/adminLogin',adminController.adminLogin);

// router.use(verifyJWT);
router.get('/getAdminOverview',adminController.getAdminOverview);
router.get('/getUsers',adminController.getUsers);
// router.post('/addjobroles',adminController.addjobroles);
router.get('/getAllJobs',adminController.getAllJobs);
router.post('/addAJob',adminController.addAJob);
router.post('/addBulkJobs',upload.single('bulkUploadSheet'),adminController.addBulkJobs);
router.post('/editJob',adminController.editJob);
router.delete('/deleteJob/:jobId',adminController.deleteJob);
router.delete('/deleteUser',adminController.deleteUser);
router.post('/addHackathon',adminController.addHackathon);
router.post('/addContest',adminController.addContest);
router.post('/addMeetup',adminController.addMeetup);
router.post('/addHackathonWinner',adminController.addHackathonWinner);
router.post('/addContestWinner',adminController.addContestWinner);
router.post('/addMeetupWinner',adminController.addMeetupWinner);
router.post('/addColleges',adminController.addColleges);
router.get('/getColleges',adminController.getColleges);
router.post('/updateStats',adminController.updateStats);
router.get('/getUsersOfACollege/:college_id',adminController.getUsersOfACollege);
router.get('/getApplFromACollege/:college_id',adminController.getApplFromACollege);
router.post('/changeUserStatus',adminController.changeUserStatus);
router.post('/dataForJobAlert',adminController.dataForJobAlert);
router.post('/addATraining',adminController.addATraining);
router.post('/addAWorkshop',adminController.addAWorkshop);
router.post('/addACourse',upload.single('thumbnail'),adminController.addACourse);

module.exports = router;

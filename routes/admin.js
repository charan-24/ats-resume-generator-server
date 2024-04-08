const exp = require('express');
const router = exp.Router();
const adminController = require('../controllers/adminController');
const verifyJWT = require('../middlewares/verifyJWT');

router.post('/adminRegister',adminController.adminRegister);
router.post('/adminLogin',adminController.adminLogin);

// router.use(verifyJWT);
router.get('/getuserDetails',adminController.getuserDetails);
router.post('/addjobroles',adminController.addjobroles);
router.get('/getAllJobs',adminController.getAllJobs);
router.post('/addAJob',adminController.addAJob);
router.post('/addBulkJobs',adminController.addBulkJobs);
router.post('/editJob',adminController.editJob);
router.delete('/deleteJob',adminController.deleteJob);
router.delete('/deleteUser',adminController.deleteUser);
router.post('/addHackathon',adminController.addHackathon);
router.post('/addContest',adminController.addContest);
router.post('/addMeetup',adminController.addMeetup);
router.post('/addHackathonWinner',adminController.addHackathonWinner);
router.post('/addContestWinner',adminController.addContestWinner);
router.post('/addMeetupWinner',adminController.addMeetupWinner);

module.exports = router;

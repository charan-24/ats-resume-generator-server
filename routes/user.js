const exp = require('express');
// const app = exp();
const router = exp.Router();
const userController = require('../controllers/userController.js');
const verifyJWT = require('../middlewares/verifyJWT');

router.post('/userRegistration',userController.userRegistration);
router.post('/userLogin',userController.userLogin);

// router.use(verifyJWT);
router.post('/selectPreferredRoles',userController.selectPreferredRoles);
router.get('/getPreferredRoles/:userid',userController.getPreferredRoles);
router.post('/editUserProfile',userController.editUserProfile);
router.post('/addWorkExp',userController.addWorkExp);
router.delete('/deleteWorkExp',userController.deleteWorkExp);
router.get('/getPreferredJobs/:userid',userController.getPreferredJobs);
router.post('/addProject',userController.addProject);
router.get('/getuserprojects/:userid',userController.getuserprojects);
router.post('/addCertificate',userController.addCertificate);
router.get('/getUserResumes/:userid',userController.getUserResumes);
router.get('/getUserCertificates/:userid',userController.getUserCertificates);
router.get('/getUserDetails/:userid',userController.getUserDetails);
router.get('/getAllJobRoles',userController.getAllJobRoles);
router.post('/resetPassword',userController.resetPassword);
router.post('/verifymail',userController.verifymail);

module.exports = router;
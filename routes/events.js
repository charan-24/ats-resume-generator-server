const exp = require('express');
const router = exp.Router();
const eventsController = require('../controllers/eventsController');

router.get('/getUpComingHackathons',eventsController.getUpComingHackathons);
router.get('/getRecentHackathons',eventsController.getRecentHackathons);
router.get('/getUpComingContests',eventsController.getUpComingContests);
router.get('/getRecentContests',eventsController.getRecentContests);
router.get('/getUpComingMeetups',eventsController.getUpComingMeetups);
router.get('/getRecentMeetups',eventsController.getRecentMeetups);
router.get('/getHackathonWinners',eventsController.getHackathonWinners);
router.get('/getContestWinners',eventsController.getContestWinners);
router.get('/getMeetupWinners',eventsController.getMeetupWinners);
router.get('/getEventStats',eventsController.getEventStats);

module.exports = router;
const exp = require('express');
const router = exp.Router();
const paymentController = require('../controllers/paymentController');

router.post('/createOrder',paymentController.createOrder);
router.post('/validatePayment',paymentController.validatePayment);
router.post('/createCoupon',paymentController.createCoupon);
router.get('/getCoupons',paymentController.getCoupons);


module.exports = router;
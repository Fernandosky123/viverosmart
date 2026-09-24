const express = require('express');
const router = express.Router();
const { login, setupStatus, setupInitialAdmin, requestPasswordReset, resetPassword } = require('../controllers/authController');

router.post('/login', login);
router.get('/setup-status', setupStatus);
router.post('/setup', setupInitialAdmin);
router.post('/password-reset/request', requestPasswordReset);
router.post('/password-reset/confirm', resetPassword);

module.exports = router;

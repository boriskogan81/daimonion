'use strict';

const Express = require('express');
const router = Express.Router();
const authenticationController = require('../controllers/authentication-controller');

router.use('/authentication', authenticationController);

module.exports = router;

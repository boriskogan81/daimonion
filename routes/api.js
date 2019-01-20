'use strict';

const Express = require('express');
const router = Express.Router();
const authenticationController = require('../controllers/authentication-controller');

router.use('/authentication', authenticationController);
router.get('/ping', (req, res) => {
    res.status(200).send({'ping status': 'success'});
});

module.exports = router;

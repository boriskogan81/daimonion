'use strict';

// This is useful for relative paths to root
global.__base = __dirname + '/';

require('./global_functions');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const configurePassport = require('./controllers/passport_jwt_config');
const httpConfig = require('./config/http');
const logger = require('./bootstrap/winston');

const app = express();

app.use(passport.initialize());
configurePassport();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/', require('./routes/index'));

app
    .listen(httpConfig.port, httpConfig.host, (error) => {
        if (error) {
            console.error(error);
            return process.exit(1);
        }
        logger.info(`Daimonion API running on ${httpConfig.host}:${httpConfig.port}`);
    });


module.exports = app;
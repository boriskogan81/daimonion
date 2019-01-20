'use strict';

const express = require('express');
const User = require('../models/user');
const Token = require('../models/token').model;
const securityConfig = require('../config/security_config');
const redis = require('../redis/redis');
const logger = require('../bootstrap/winston');
const uuid4 = require('uuid4');

const router = express.Router();

const issueToken = async (user_id) => {
    const user = await User.where('id', user_id)
        .fetch({require: true});
    let tokenExpiration = new Date();
    tokenExpiration.setDate(tokenExpiration.getDate() + securityConfig.expiration_interval);
    const savedToken = await new Token()
        .save({
            token: uuid4(),
            expires: tokenExpiration,
            user_id
        });
    logger.info(`Token stored for user id ${user_id}`);
    await redis.set(`token:for:user_id:${user_id}`, JSON.stringify(savedToken.attributes));
    await redis.set(`user:for:token:${savedToken.attributes.token}`, JSON.stringify(user.attributes));
    return savedToken.attributes.token;
};

const updateToken = async (token_id) => {
    let tokenExpiration = new Date();
    tokenExpiration.setDate(tokenExpiration.getDate() + securityConfig.expiration_interval);
    const oldToken = await Token.where('id', token_id)
        .fetch({require: true});
    const savedToken = await new Token()
        .where({
            id: token_id
        })
        .save({
            'token': uuid4(),
            'expires': tokenExpiration
        }, {patch: true});
    logger.info(`Token id ${token_id} updated`);
    const user = await User.where('id', savedToken.attributes.user_id)
        .fetch({require: true});
    await redis.set(`token:for:user_id:${savedToken.attributes.user_id}`, JSON.stringify(savedToken.attributes));
    await redis.set(`user:for:token:${savedToken.attributes.token}`, JSON.stringify(user.attributes));
    await redis.del(`user:for:token:${oldToken.attributes.token}`);
    return savedToken.attributes.token;
};

router.post('/login', async (req, res) => {
    try {
        const {username, password} = req.body;
        logger.info(`Login attempt by ${username}`);
        const user = await User.where('username', username)
            .fetch({
                require: true
            })
            .catch(err => {
                logger.error(`Login failed with error ${err}`);
                TE(err);
            });
        const isValidPassword = await user.validPassword(password);
        if (isValidPassword) {
            const successMessageObject = {
                message: 'Successful login.',
                user: user.omit('password'),
                token: await issueToken(user.attributes.id)
            };
            logger.info(`Successful login by ${username}`);
            return ReS(res, successMessageObject, 200);
        } else {
            logger.info(`Failed login by ${username}`);
            return ReE(res, 'Authentication failed');
        }
    }
    catch (e) {
        logger.error(`User login request failed with error ${e}`);
        return ReE(res, e, 500);
    }
});

router.post('/register', async (req, res) => {
    try {
        let {username, password, email, phone, password_confirm, first_name, last_name} = req.body;
        logger.info(`Registration attempt by ${username}`);
        if(!username || !password){
            logger.error(`Registration attempt failed: either username ${username} or password ${password} is missing`);
            return ReE(res, 'password does not match password confirmation', 422);
        }
        if (password !== password_confirm){
            logger.error(`Registration attempt by ${username} failed: password does not match password confirmation`);
            return ReE(res, 'password does not match password confirmation', 422);
        }
        const existingUser = await User.where('username', username)
            .fetch();
        if (existingUser)
            return ReE(res, 'A user with this username is already registered', 422);
        const user = await User.forge({username, password, email, phone, first_name, last_name}).save();
        const successMessageObject = {
            message: 'Successful registration.',
            user: user.omit('password'),
            token: await issueToken(user.attributes.id)
        };
        logger.info(`Successful login by ${username}`);
        return ReS(res, successMessageObject, 200);
    }
    catch (e) {
        logger.error(`User registration request failed with error ${e}`);
        return ReE(res, e, 500);
    }
});

router.post('/authenticate', async (req, res) => {
    const checkToken = req.body.token;
    logger.info(`Authentication attempt  with ${checkToken}`);
    try {
        const now = new Date();
        let token, successMessageObject, user;
        const userForToken = await redis.get(`user:for:token:${checkToken}`);
        if(userForToken){
            token = await redis.get(`token:for:user_id:${JSON.parse(userForToken).id}`);
        }

        if(token){
            token = JSON.parse(token);
            user = await redis.get(`user:for:token:${token.token}`)
        }

        else{
            token = await Token
                .where('token', checkToken)
                .fetch({withRelated: ['user']})
                .serialize();
            if(token){
                let userRaw = {...token.related('user')};
                const {password, ...userObj } = userRaw.attributes;
                user = userObj;
            }
        }


        if (!token) {
            logger.error(`Authentication attempt failed: failed to find an access token for ${checkToken} in database`);
            return ReE(res, 'Invalid token', 422);
        }

        if(new Date(token.expires) < now)
        {
            const newToken = await updateToken(token.id);

            successMessageObject = {
                message: 'Updated',
                user,
                token: newToken.attributes.token
            };
        }
        else{
            successMessageObject = {
                message: 'Valid',
                user
            };
        }

        logger.info(`Token authentication with token ${checkToken} successful`);

        ReS(res, successMessageObject, 200);
    }
    catch (e) {
        logger.error(`Token authentication attempt failed with error ${e}`);
        ReE(res, e, 500);
    }
});


module.exports = router;
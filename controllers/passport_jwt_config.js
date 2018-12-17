'use strict';

const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const securityConfig = require('../config/security_config');
const User = require('../models/user');

module.exports = function () {
	const opts = {};
	opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
	opts.secretOrKey = securityConfig.jwtSecret;
	passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
		User.where('id', jwt_payload.id).fetch({withRelated: 'roles'})
			.then(user => user ? done(null, user) : done(null, false))
			.catch(err => done(err, false));
	}));
};
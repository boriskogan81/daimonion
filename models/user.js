'use strict';

const bookshelf = require('../bootstrap/bookshelf_instance').bookshelf;
const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require('bcrypt'));
const securityConfig = require('../config/security_config');

module.exports = bookshelf.Model.extend({
    tableName: 'user',
    validPassword (password) {
        return bcrypt.compareAsync(password, this.attributes.password);
    },
    initialize () {
        this.on('saving', model => {
            if (!model.hasChanged('password')) return;

            return Promise.coroutine(function * () {
                const salt = yield bcrypt.genSaltAsync(securityConfig.saltRounds);
                const hashedPassword = yield bcrypt.hashAsync(model.attributes.password, salt);
                model.set('password', hashedPassword);
            })();
        });
    }
});
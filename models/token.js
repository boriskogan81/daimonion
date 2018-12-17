'use strict';

const bookshelf = require('../bootstrap/bookshelf_instance').bookshelf;
const User = require('./user');

const token = bookshelf.Model.extend({
    tableName: 'token',
    user () {
        return this.belongsTo(User);
    }
});

module.exports.model = token;
'use strict';
let dbConfig, knex;

if (process.env.NODE_ENV === 'test') {
    dbConfig = require('../config/db_config')['test'];
    knex = require('knex')(dbConfig);
    knex.processFlag = 'test';
}
else{
    dbConfig = require('../config/db_config')['production'];
    knex = require('knex')(dbConfig);
}

const jsonColumns = require('bookshelf-json-columns');

const bookshelf = require('bookshelf')(knex);
bookshelf.plugin(jsonColumns);
bookshelf.plugin('pagination');
bookshelf.plugin('registry');

module.exports.bookshelf = bookshelf;
module.exports.knex = knex;
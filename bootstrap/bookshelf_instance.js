'use strict';
let dbConfig, knex;

if (process.env.NODE_ENV === 'test') {
    dbConfig = require('../config/db_config')['test'];
    knex = require('knex')(dbConfig);
    knex.processFlag = 'test';
}
else{
    dbConfig = require('../config/db_config')['production'];
    dbConfig.user = process.env.SQL_USER;
    dbConfig.database = process.env.SQL_DATABASE;
    dbConfig.password = process.env.SQL_PASSWORD;
    if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
        dbConfig.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
    }
    knex = require('knex')(dbConfig);
}

const jsonColumns = require('bookshelf-json-columns');

const bookshelf = require('bookshelf')(knex);
bookshelf.plugin(jsonColumns);
bookshelf.plugin('pagination');
bookshelf.plugin('registry');

module.exports.bookshelf = bookshelf;
module.exports.knex = knex;
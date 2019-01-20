const dbConfig = require('./config/db_config');
dbConfig.test.pool['idleTimeoutMillis']= Infinity;

const connect= {
    production: dbConfig.production,
    test: dbConfig.test
};

if(process.env.NODE_ENV ==='test')
    module.exports = connect.test;
else
    module.exports = connect.production;
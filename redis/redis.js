const redisConf = require('../config/redis_config'),
    Redis = require('ioredis'),
    logger = require('../bootstrap/winston');

let redis;
if (!redis) {
    redis = new Redis(redisConf);
    redis.on('error', error => logger.error(error));
}

module.exports = redis;

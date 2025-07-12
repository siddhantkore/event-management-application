const NodeCache = require('node-cache'); // for local memory cache
const { createClient } = require('redis')
const dotenv = require('dotenv');

dotenv.config({ path: '../env/.env.development' });


// export const localCache = new NodeCache({
//     stdTTL : 3000
// }); For LocalCache

const redisClient = createClient({
    url: process.env.REDIS_URL
});

(async () => {
    try {
        await redisClient.connect();
        console.info('Redis client connected successfully!');
    } catch (err) {
        console.error('Failed to connect Redis client:', err);
    }
})();


module.exports = redisClient;
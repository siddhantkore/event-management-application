const redisClient = require('./initializeCache');


export async function getCache (key, fetchFn, ttl = 300) {
  
  let value = await redisClient.get(key);

  if(value) {

    console.info('redis cache hit');
    value = JSON.parse(value);

    return value;
  }

  console.warn('not found in cache: fetching from DB');

  value = await fetchFn();

  return value;

}

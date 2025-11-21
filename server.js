const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('./utils/logger')


// keep limited initially
//  Configure and remove unnecessory
//  Use CI-CD then for improvement after initial deployment


const envFile = process.env.NODE_ENV === 'production' ? './env/.env.production' : './env/.env.development';
dotenv.config({ path: envFile });

const app = require('./app');

const PORT = process.env.PORT || 3000;
const mongo_uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/EventApplicationDB"

mongoose
  .connect(mongo_uri)
  .then(() => {
    logger.info(`MongoDB Connected [${process.env.NODE_ENV}]`);
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Database Connection Error:', err);
  });

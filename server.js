const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('./utils/logger')

const envFile = process.env.NODE_ENV === 'production' ? './env/.env.production' : './env/.env.development';
dotenv.config({ path: envFile });

const app = require('./app');

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info(`MongoDB Connected [${process.env.NODE_ENV}]`);
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Database Connection Error:', err);
  });

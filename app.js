const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const healthRoute = require('./routes/healthRoute');
const eventRoute = require('./routes/eventRoute');
const globalErrorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
// app.use('/api/v1/events/all', eventRoute);
app.use('/api/v1/health', healthRoute); 

app.use(globalErrorHandler);

module.exports = app;

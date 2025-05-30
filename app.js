const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pino = require('pino-http')();


const healthRoute = require('./routes/healthRoute');
const eventRoute = require('./routes/eventRoute');
const globalErrorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares
// app.use(cors());
app.use(express.json());
// app.use(morgan('dev'));
app.use(pino);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

//middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// Routes
// app.use('/api/v1/events/all', eventRoute);
app.use('/', (req, res, next) => {
  res.status(200).sendFile(path.join(__dirname, 'views', 'demohome.html'));
});
app.use('/api/health', healthRoute);
app.use('/api/payments', require('./routes/paymentRoute'));
app.use('/api/reports', require('./routes/reportRoute'));
app.use('/api/coupons', require('./routes/couponRoute'));
app.use('/api/analytics', require('./routes/analyticsRoute'));

app.use(globalErrorHandler);

app.use('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

module.exports = app;

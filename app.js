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
const notificationRoute = require('./routes/notificationRoute');
const userRoute = require('./routes/userRoute');
const reportRoute = require('./routes/reportRoute');
const registrationRoute = require('./routes/registrationRoute');
const paymentRoute = require('./routes/paymentRoute');
const authRoute = require('./routes/auth/authRoute');
const analyticsRoute = require('./routes/analyticsRoute');



const app = express();

// Middlewares
app.use(express.json());
// app.use(morgan('dev'));
app.use(pino);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

//middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// keep Admin Routes or admin access at different separate route

// *** ADMIN ***



// *** USER ***

// /api/admin/reports
// /api/admin/certificate
// /api/admin/events creating
// /api/admin/analytics

app.use('/api/auth',authRoute);
app.use('/api/health', healthRoute);
app.use('/api/events',eventRoute);
app.use('api/user/profile',userRoute);
app.use('/api/user/notifications',notificationRoute);
app.use('/api/registration',registrationRoute);
app.use('/api/payments', paymentRoute);
app.use('/api/reports', reportRoute);
app.use('/api/analytics', analyticsRoute);

app.use(globalErrorHandler);

app.use('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

module.exports = app;

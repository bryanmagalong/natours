const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// MIDDLEWARES ================
// Set security HTTP headers
app.use(helmet()); // best to set in the begginning of the middleware stack

// We want to call this middleware only on development environment
if (process.env.NODE_ENV === 'development') app.use(morgan('dev')); // generate response logs

// Rate Limit: to prevent DoS and brute force attacks
const limiter = rateLimit({
  max: 100, // max number of requests allowed
  windowMs: 60 * 60 * 1000, // allow "max" number request per IP / windowMs
  message: 'Too many request from this IP. Please try again in a hour.',
});

app.use('/api', limiter); // apply this limiter middleware only on our api

// Body Parser, reading data from req.body
// The middleware attach a body in req
// limit: '10kb': req.body exceeding 10kb will not be accepted
app.use(express.json({ limit: '10kb' }));

// Serving static files
app.use(express.static(`${__dirname}/public`)); // we can now access to static files from public folder

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// Mounting the routers
app.use('/api/v1/tours', tourRouter); //connects the tourRouter to the '/api/v1/tours' url
app.use('/api/v1/users', userRouter);

// This middleware will run only if the url is not handled by any router
// all: get, patch, post, delete method
app.all('*', (req, res, next) => {
  /*
   * If an argument is passed in next(),
   * Express will assume that there was an error
   * and will skip all the middlewares in the middleware stack
   * and send the error to the error handling middleware */
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//==== ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;

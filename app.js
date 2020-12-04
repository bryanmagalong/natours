const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// MIDDLEWARES ================
// We want to call this middleware only on development environment
if (process.env.NODE_ENV === 'development') app.use(morgan('dev')); // generate response logs

app.use(express.json()); // The middleware attach a body in req
app.use(express.static(`${__dirname}/public`)); // we can now access to static files from public folder

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
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

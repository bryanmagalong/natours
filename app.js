const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// MIDDLEWARES ================
app.use(morgan('dev')); // generate response logs
app.use(express.json()); // The middleware attach a body in req

app.use((req, res, next) => {
  console.log('Hello from the middleware !!!!');
  next(); // NEVER FORGET TO USE next(), otherwise the response-request cycle will be stuck
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // we can now get the request time for all of our requests
  next(); // NEVER FORGET TO USE next(), otherwise the response-request cycle will be stuck
});

// Mouting the routers
app.use('/api/v1/tours', tourRouter); //connects the tourRouter to the '/api/v1/tours' url
app.use('/api/v1/users', userRouter);

module.exports = app;

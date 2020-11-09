const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

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

// CONTROLLERS ===============
// Read tours file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`),
);

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  // req.params is an object that contains dynamic variables
  console.log(req.params);
  // req.params.id is a string,
  // req.params.id*1 convert it into a number
  const id = req.params.id * 1;
  // we get the tour with the id specified in the route
  const tour = tours.find((elem) => elem.id === id);

  // if tour is undefined
  if (!tour)
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  // we need a middleware to get body from req
  // console.log(req.body);

  // create a new tour object
  // don't need to specify the id with a databased API
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  // save the new tour in the array
  tours.push(newTour);

  // overwrite the tours file with the new array and send the new tour created in response
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      // 201: created
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    },
  );
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined !!!',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined !!!',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined !!!',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined !!!',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined !!!',
  });
};

const updateTour = (req, res) => {
  //TODO when we get into databased API
  if (req.params.id * 1 > tours.length)
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res.status(200).json({
    status: 'success',
    data: '<Updated tour>',
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length)
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res.status(204).json({
    status: 'success',
    data: null, // null since we delete the data
  });
};

// ROUTES ==================
app.route('/api/v1/tours').get(getAllTours).post(createTour); // we set the route url '/api/v1/tours' for GET all tours and POST methods
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app.route('/api/v1/users').get(getAllUsers).post(createUser);
app.route('/api/v1/user/:id').get(getUser).patch(updateUser).delete(deleteUser);

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port} ...`);
});

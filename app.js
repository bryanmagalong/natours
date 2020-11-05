const express = require('express');
const fs = require('fs');

const app = express();

// Middleware
// The middleware attach a body in req
app.use(express.json());

/**
 * app.get(route, callback)
 * res.status(statusCode).json(Object)
 */
// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post in to this endpoints ... ');
// });

// Read tours file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`),
);

// GET all tours
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

// GET by id
app.get('/api/v1/tours/:id', (req, res) => {
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
});

// POST a tour
app.post('/api/v1/tours', (req, res) => {
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
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port} ...`);
});

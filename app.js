const express = require('express');
const fs = require('fs');

const app = express();

// Middleware
// The middleware attach a body in req
app.use(express.json());

// Read tours file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`),
);

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
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

// ENDPOINTS ==================
// GET all tours
// app.get('/api/v1/tours', getAllTours);

// GET by id
// app.get('/api/v1/tours/:id', getTour);

// POST a tour
// app.post('/api/v1/tours', createTour);

// PATCH a tour by id
// app.patch('/api/v1/tours/:id', updateTour);

// DELETE a tour by id
// app.delete('/api/v1/tours/:id', deleteTour);

app.route('/api/v1/tours').get(getAllTours).post(createTour); // we set the route for GET and POST methods
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port} ...`);
});

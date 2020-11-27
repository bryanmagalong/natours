const Tour = require('../models/tourModel');

// Verify if the name or the price is missing in the request body
exports.checkBody = (req, res, next) => {
  const { name, price } = req.body;

  // console.log(`Name: ${name}; Price: ${price}`);

  if (!name || !price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price !!!',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    // results: tours.length,
    // data: {
    //   tours,
    // },
  });
};

exports.getTour = (req, res) => {
  // req.params.id is a string,
  // req.params.id*1 convert it into a number
  const id = req.params.id * 1;
  // we get the tour with the id specified in the route
  // const tour = tours.find((elem) => elem.id === id);

  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour,
  //   },
  // });
};

exports.createTour = (req, res) => {
  res.status(201).json({
    status: 'success',
    // data: {
    //   tour: newTour,
    // },
  });
};

exports.updateTour = (req, res) => {
  //TODO when we get into databased AP

  res.status(200).json({
    status: 'success',
    data: '<Updated tour>',
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null, // null since we delete the data
  });
};

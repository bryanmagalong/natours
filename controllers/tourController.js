const express = require('express');
const fs = require('fs');

// Read tours file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);

// Verify if the id exists
exports.checkId = (req, res, next, val) => {
  console.log(`Tour id is : ${val}`);
  if (val * 1 > tours.length)
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
  next();
};

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
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  // req.params.id is a string,
  // req.params.id*1 convert it into a number
  const id = req.params.id * 1;
  // we get the tour with the id specified in the route
  const tour = tours.find((elem) => elem.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
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

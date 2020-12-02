/* eslint-disable prettier/prettier */
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/APIFeatures');

exports.aliasTopTours = (req, res, next) => {
  // Prefilling fields
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    //==CHAINING METHODS
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    //== EXECUTE THE QUERY
    const tours = await features.query;

    //== SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // the method will returns the tour after update is applied
      runValidators: true, // runs validators on update
    });

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null, // null since we delete the data
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getToursStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        // stage
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          // $toUpper will set the difficulty string in uppercase
          _id: { $toUpper: '$difficulty' }, // will calculate stats by difficulty group
          numTours: { $sum: 1 }, // num + 1 for each document
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 }, // 1 for ascending
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: { stats },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates', // $unwind creates a document for each element of the startDates array
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`), // >= 1st Jan 2021
            $lte: new Date(`${year}-12-31`), // <= 31st Dec 2021
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' }, // grouping by the month
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }, // array of tours of the month
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          // '0' to hide the field, '1' to display it
          _id: 0,
        },
      },
      {
        // '1': ascending, '-1': descending
        $sort: { numTourStarts: -1 },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

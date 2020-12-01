/* eslint-disable prettier/prettier */
const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);

    //===== FILTERING
    const queryObj = { ...req.query }; // we copy the query obj
    const excludedFields = [ 'page', 'sort', 'limit', 'fields' ];
    excludedFields.forEach((el) => delete queryObj[el]); // will delete in queryObj all matching fields

    //===== ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    // Regex: any occurence of 'gte', 'gt', 'lte', 'lt'
    // match parameter is the matched string
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));

    //===== BUILD THE QUERY
    let query = Tour.find(JSON.parse(queryStr));

    //===== SORTING
    if (req.query.sort) {
      // Sort query
      // { sort: 'price -ratingsAverage' }
      // sort by ascending price , if same price then sort by descending (-) ratingsAverage

      // chaining a query
      const sortBy = req.query.sort.split(',').join(' '); // replace all ',' with ' '
      // console.log(sortBy);
      query = query.sort(sortBy);
    }
    else {
      // Default sort by descending creation date
      query = query.sort('-createdAt');
    }

    // FIELD LIMITING
    if (req.query.fields) {
      // chaining a query
      const fields = req.query.fields.split(',').join(' ');
      console.log('FIELDS: ', fields);
      query = query.select(fields); // query.select('name duration price')
    }
    else {
      query = query.select('-__v'); // will exclude the '__v' field
      // Can't combine exclusion and inclusion, ie. '-name duration'
    }
    //===== EXECUTE THE QUERY
    const tours = await query;

    //===== SEND RESPONSE
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

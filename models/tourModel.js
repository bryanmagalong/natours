/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');

// Tour schema
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [ true, 'A tour must have a name!' ],
    unique: true,
    trim: true, // remove all the white spaces on the beginning and the end of the string
  },
  duration: {
    type: Number,
    required: [ true, 'A tour must have a duration' ],
  },
  maxGroupSize: {
    type: Number,
    required: [ true, 'A tour must have a maximum group size' ],
  },
  difficulty: {
    type: String,
    required: [ true, 'A tour shouls have a difficulty' ],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [ true, 'A tour must have a price!' ],
  },
  priceDiscount: {
    type: Number,
  },
  summary: {
    type: String,
    trim: true,
    required: [ true, 'A tour must have a summary' ],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [ true, 'A tour must have a cover image' ],
  },
  images: [ String ],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false, // will not be displayed
  },
  startDates: [ Date ],
});

const Tour = mongoose.model('Tour', tourSchema); // creates a model from the tour schema

module.exports = Tour;

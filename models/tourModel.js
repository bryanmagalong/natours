/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const slugify = require('slugify');

// Tour schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [ true, 'A tour must have a name!' ],
      unique: true,
      trim: true, // remove all the white spaces on the beginning and the end of the string
    },
    slug: {
      type: String,
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
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true }, // each time the data is outputed as JSON, we want virtuals properties to be part of the output
    toObject: { virtuals: true }, // each time the data is outputed as an Object
  },
);

/**
 * Virtual property, not saved in database.
 * We use the regular function format in order to access to 'this'
 * We can't query for those properties
 * */
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7; // 'this' refers to the current document
});

//==== DOCUMENT MIDDLEWARE
// here, 'this' will refer to the current document
// runs before the .save() and .create() methods
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//==== QUERY MIDDLEWARE
// here, 'this' will refer to a query object
// runs before the .find() query method

// tourSchema.pre('find', function(next) {
// REGEX: anything sarting with find
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`==== Query took ${Date.now() - this.start} milliseconds!!!!`);
  // console.log(docs);
  next();
});

const Tour = mongoose.model('Tour', tourSchema); // creates a model from the tour schema

module.exports = Tour;

/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

// Tour schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [ true, 'A tour must have a name!' ],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A tour name must have less or equal than 40 characters',
      ],
      minlength: [
        10,
        'A tour name must have more or equal than 10 characters',
      ],
      // validation with validator.js
      // validate: [
      //   validator.isAlpha,
      //   'Tour name must only contains characters',
      // ],
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
      required: [ true, 'A tour should have a difficulty' ],
      enum: {
        values: [ 'easy', 'medium', 'difficult' ],
        message: 'Difficulty is either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [ 1, 'Rating must be above 1.0' ],
      max: [ 5, 'Rating must be below 5.0' ],
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
      validate: {
        validator: function(val) {
          // 'this' only points to the current document on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below the regular pice',
      },
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

//==== DOCUMENT MIDDLEWARE
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//==== QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`==== Query took ${Date.now() - this.start} milliseconds!!!!`);
  next();
});

//==== AGGREGATION MIDDLEWARE
// here, 'this' refers to the aggregation object
tourSchema.pre('aggregate', function(next) {
  // Adds a new stage at the start of the array
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // console.log(this.pipeline());

  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

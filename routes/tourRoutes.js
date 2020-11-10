const express = require('express');

const tourController = require('./../controllers/tourController');
const router = express.Router(); // creates a new router

router.param('id', tourController.checkId);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour); // checkBody middleware will be called before the createTour middleware
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;

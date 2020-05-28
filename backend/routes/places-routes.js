const express = require('express');
const { check } = require('express-validator');

const placesControllers = require('../controllers/places-controllers');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);

// middleware that checks for valid token. Subsequent routes cannot be reached without valid token
router.use(checkAuth);

// Before any middleware we include our fileUpload middleware with multer,
// here we want to retrieve a single file and the name in the body of req that holds the file
// Validator middleware is placed before our createNote middleware
router.post(
  '/',
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address')
      .not()
      .isEmpty()
  ],
  placesControllers.createPlace
);

// Validator middleware is placed before our updateNote middleware
router.patch(
  '/:pid',
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
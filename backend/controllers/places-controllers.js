const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  // Search DB
  let place;
  try {
    //get back a mongoose object
    place = await Place.findById(placeId);
  } catch (err) {
    //error will be caught if get request has problem
    const error = new HttpError(
      'Something went wrong, could not find a place.',
      500
    );
    return next(error);
  }

  // if the provided placeId is not found in our db return error
  if (!place) {
    const error = new HttpError(
      'Could not find place for the provided id.',
      404
    );
    return next(error);
  }

  //turn our given mongoose object back to a JS object.
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;
  try {
    // get back a list of mongoose objects
    places = await Place.find({ creator : userId});
  } catch (err) {
    //error will be caught if get request has problem
    const error = new HttpError(
      'Fetching places failed, please try again later.',
      500
    );
    return next(error);
  }

  if (!places || places.length === 0) {
    const error = new HttpError(
      'Could not find places for the provided user id.',
      404
    );
    return next(error);
  }

  // since notes is a mongoose array we use map on each element and make it into an object
  res.json({places: places.map(place => place.toObject({ getters: true}))});
};

const createPlace = async (req, res, next) => {
  //look at req and check if any validation errors were detected
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  //Extract data from incoming requests
  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  //Create Place object based on info from req body
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: 'https://live.staticflickr.com/7631/26849088292_36fc52ee90_b.jpg',
    creator: req.userData.userId
  });

  // Check if user exist in DB
  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again. Caught checking user existence',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }

  //console.log('User: ' + user);
  //console.log('Place: ' + createdPlace);

  //store created Place document to db, assign user place array with created Place
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    //save created place to db
    await createdPlace.save({ session: sess }); 
    //add place to users' places array
    user.places.push(createdPlace); 
    await user.save({ session: sess }); 
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again. Caught in the transaction',
      500
    );
    // stop code execution if we have an error
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  //look at req and check if any validation errors were detected
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  // Search DB for place 
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

  // Check if the place's creator matches the incoming request userId we got from the token
  // We need to add toString because place.creator is a mongoose object
  if(place.creator.toString() !== req.userData.userId){
    const error = new HttpError(
      'You are not allowed to edit this place.',
      401
    );
    // return error if unauthorized to update place
    return next(error);
  }

  // make changes for the found place in the DB
  place.title = title;
  place.description = description;

  // store updated place
  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

  //turn our given mongoose object back to a JS object.
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  //Search DB
  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }

  // Check if the place's creator matches the incoming request userId we got from the token
  // We dont need to include toString because place.creator.id is already a string
  if(place.creator.id !== req.userData.userId){
    const error = new HttpError(
      'You are not allowed to delete this place.',
      401
    );
    // return error if unauthorized to update place
    return next(error);
  }

  // Try removing note from notes collection and remove the note from creator's notes array
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({session: sess});
    place.creator.places.pull(place);   // we are able to do this because of populated the place object
    await place.creator.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'Deleted place.' });
};

//export pointers to the functions
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
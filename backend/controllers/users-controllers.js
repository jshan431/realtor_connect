const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUser = async (req, res, next) => {
  // Search DB
  let user;
  try {
    // req.user exists because of the auth middleware
    user = await User.findById(req.userData.userId).select('-password');

  } catch(err) {
    console.log('I am in the catch')
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json(user);
}

const getUsers = async (req, res, next) => {
  // Search DB
  let users;
  try {
    // get back an array of mongoose object minus the password
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  //look at req and check if any validation errors were detected
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { name, email, password } = req.body;

  //Check if email already exist in the DB
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Existing User. Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  //if email exist in db already throw error
  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead.',
      422
    );
    return next(error);
  }

  // Create a hashed password using bcrypt library
  let hashedPassword;
  try{
    // hash password from incoming request. Second argument is the number of salting rounds
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = newHttpError(
      'Could not create User, please try again.',
      500
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: 'https://live.staticflickr.com/7631/26849088292_36fc52ee90_b.jpg',
    password: hashedPassword,
    places: []
  });

  // Store created user in DB
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  //generate token
  let token;
  try{
    //sign returns a string. First argument is the payload (data to encode)
    //Second argument is the private key
    token = jwt.sign(
      {userId: createdUser.id, email: createdUser.email}, 
      process.env.JWT_KEY,     //key here must be the same as in login
      {expiresIn: '1h'}
    );
  } catch (err){
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }
 
  // send back userId, email, and token
  res.status(201).json({ userId: createdUser.id, email: createdUser.email , token: token});
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  //Check if email already exist in the DB
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Loggin in failed, try again later.',
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in. User does not exists',
      401
    );
    return next(error);
  }


  let isValidPassword = false;
  try{
    // Compare the incoming password from the req to the hashed password in the DB with the use of bcrypt
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'Could not log you in, please check your credentials and try again.',
      500
    );
    return next(error);
  }
  
  // if isValidPassword is false return invalid credentials
  if(!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    );
    return next(error);
  }

  // Generate token
  let token;
  try{
    //sign returns a string. First argument is the payload (data to encode)
    //Second argument is the private key
    token = jwt.sign(
      {userId: existingUser.id, email: existingUser.email}, 
      process.env.JWT_KEY,     //key here must be the same as in signup
      {expiresIn: '1h'}
    );
  } catch (err){
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }

  //send back id, email, and token
  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token
  });
};

exports.getUsers = getUsers;
exports.getUser = getUser;
exports.signup = signup;
exports.login = login;

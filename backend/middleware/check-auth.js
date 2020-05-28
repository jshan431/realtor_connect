/**
 * This middleware contains all the logic to validate an incoming request for its token.
 * Middlewares are functions that accepts req, res, and next objects
 */

const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

// Check if we have a token and if that token is valid
module.exports = (req, res, next) => {
  // Check if request method is equal to options, if so allow request to continue because OPTIONS request are send before POST requests
  if(req.method === 'OPTIONS'){
    return next();
  }
  try{
    // access the req object's headers property, which contains authorization. We allows client to have headers 
    // with authorization in app.js. Split the header and get token in the second element in the array
    const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'

    if(!token) {
      throw new Error('Authentication failed in token check!');
    }
    // verify the token. Second argument should contain the private key used to get generate the key in users-controller.js
    // decodedToken contains the payload that was encoded in the token when we signed it
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);

    // Add a property called userData to the req. body that cotains userId decoded from the token
    req.userData = {userId: decodedToken.userId};
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed in catch!', 401);
    return next(error);
  }
};
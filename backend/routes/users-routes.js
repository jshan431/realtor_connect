const express = require('express');
const { check } = require('express-validator');

const checkAuth = require('../middleware/check-auth');

const usersController = require('../controllers/users-controllers');

const router = express.Router();

router.get('/', usersController.getUsers);

// Before any middleware we include our fileUpload middleware with multer,
// here we want to retrieve a single file and the name in the body of req that holds the file
// Validator middleware is placed before our signup middleware
router.post(
  '/signup',
  [
    check('name')
      .not()
      .isEmpty(),
    check('email')
      .normalizeEmail()
      .isEmail(),
    check('password').isLength({ min: 6 })
  ],
  usersController.signup
);

router.post('/login', usersController.login);

// middleware that checks for valid token. Subsequent routes cannot be reached without valid token
router.use(checkAuth);

router.get('/getuser', usersController.getUser);

module.exports = router;
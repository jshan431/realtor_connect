const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const profilesController = require('../controllers/profiles-controllers');
const { check } = require('express-validator');

router.get('/', profilesController.getAllProfiles);

router.get('/user/:user_id', profilesController.getProfileById);

// middleware that checks for valid token. Subsequent routes cannot be reached without valid token
router.use(checkAuth);

// @route  GET api/profile/me
// @desc   Test Get current users profile
// @access Private
router.get('/me', profilesController.getMe);

// @route  POST api/profile
// @desc   Create or update user profile
// @access Private
router.post('/', 
  [
    check('status', 'Status is required').not().isEmpty()
  ],
  profilesController.createProfile
);

// @route  POST api/profile
// @desc   Create or update user profile
// @access Private
router.patch('/:pid', 
  [
    check('status', 'Status is required').not().isEmpty()
  ],
  profilesController.updateProfile
);

// @route  DELETE api/profile
// @desc   Delete profile, user & posts
// @access Private
router.delete('/:pid', profilesController.deleteProfile);

// @route  PUT api/profile/experience
// @desc   Add profile experience
// @access Private
router.put('/experience',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
  ] , 
  profilesController.updateProfileExperience
);

// @route  DELETE api/profile/experience/:exp_id
// @desc   Delete experiece from profile
// @access Private
router.delete('/experience/:exp_id', profilesController.deleteProfileExperience);

// @route  PUT api/profile/education
// @desc   Add profile education
// @access Private
router.put('/education',
  [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
  ], 
  profilesController.updateProfileEducation
);

// @route  DELETE api/profile/education/:edu_id
// @desc   Delete education from profile
// @access Private
router.delete('/education/:edu_id', profilesController.deleteProfileEducation);

module.exports = router;

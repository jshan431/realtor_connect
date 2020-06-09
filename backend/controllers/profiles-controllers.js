const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const User = require('../models/user');
const Profile = require('../models/profile');

const getMe = async (req, res, next) => {
  const creator = req.userData.userId;
  try {
    const profile = await Profile.findOne({ creator }).populate('creator', 
      [
        'name',
        'image'
      ]
    );
    console.log('Profile: ' + profile);
    if(!profile){
      return res.status(400).json({ msg: 'There is no profile for this user'});
    }
    res.json(profile);
  } catch(err) {
    const error = new HttpError(
      'Something went wrong, could not fetch me.',
      500
    );
    return next(error);
  };
};

const getAllProfiles = async (req, res, next) => {
  let profiles
  try {
    profiles = await Profile.find().populate('creator', ['name', 'image']);
  } catch (err) {
    const error = new HttpError(
      'Searching profiles failed, please try again. Caught in the catch',
      500
    );
  }
  res.json(profiles);
}

const getProfileById = async (req, res, next) => {
  let profile;
  try {
    profile = await Profile.findOne({ creator: req.params.user_id }).populate('creator', ['name', 'image']);
    if(!profile) return res.status(400).json({ msg: 'There is no profile for this user'});
  } catch (err) {
    const error = new HttpError(
      'Searching profile failed, please try again. Caught in the catch',
      500
    );
  }
  res.json(profile);
}

const createProfile = async (req, res, next) => {
  //look at req and check if any validation errors were detected
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  //Extract data from incoming requests
  const {
    company,
    location,
    website,
    bio,
    status,
    youtube,
    twitter,
    instagram,
    linkedin,
    facebook
  } = req.body;

  //Create Place object based on info from req body
  const createdProfile = new Profile({
    creator : req.userData.userId,
    company,
    location,
    website,
    bio,
    status,
    youtube,
    twitter,
    instagram,
    linkedin,
    facebook
  });

  // Check if user exist in DB
  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      'Creating profile failed, please try again. Caught checking user existence',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }

  //console.log('User: ' + user);
  //console.log('Profile: ' + createdProfile);

  //store created Profile document to db, assign user place array with created Profile
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    //save created place to db
    await createdProfile.save({ session: sess }); 
    //add place to users' places array
    //user.profile.push(createdProfile); 
    user.profile = createdProfile;
    await user.save({ session: sess }); 
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating profile failed, please try again. Caught in the catch',
      500
    );
    // stop code execution if we have an error
    return next(error);
  }

  res.status(201).json({ profile: createdProfile });
  
};

const updateProfile = async (req, res, next) => {
  //look at req and check if any validation errors were detected
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  //Extract data from incoming requests
  const {
    company,
    location,
    website,
    bio,
    status,
    youtube,
    twitter,
    instagram,
    linkedin,
    facebook
  } = req.body;

  const profileId = req.params.pid;

  // Search DB for place 
  let profile;
  try {
    profile = await Profile.findById(profileId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update profile.',
      500
    );
    return next(error);
  }

  // Check if the profile's creator matches the incoming request userId we got from the token
  // We need to add toString because place.creator is a mongoose object
  if(profile.creator.toString() !== req.userData.userId){
    const error = new HttpError(
      'You are not allowed to edit this place.',
      401
    );
    // return error if unauthorized to update place
    return next(error);
  }

  // make changes for the found place in the DB

  profile.company = company;
  profile.location = location;
  profile.website = website;
  profile.bio = bio;
  profile.status = status;
  profile.youtube = youtube;
  profile.twitter = twitter;
  profile.instagram = instagram;
  profile.linkedin = linkedin;
  profile.facebook = facebook;

  // store updated place
  try {
    await profile.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

  //turn our given mongoose object back to a JS object.
  res.status(200).json({ profile: profile.toObject({ getters: true }) });
};

const deleteProfile = async (req, res, next) => {
  const profileId = req.params.pid;

  //Search DB
  let profile;
  try {
    profile = await Profile.findById(profileId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete profile.',
      500
    );
    return next(error);
  }

  if (!profile) {
    const error = new HttpError('Could not find profile for this id.', 404);
    return next(error);
  }

  // Check if the profile's creator matches the incoming request userId we got from the token
  // We dont need to include toString because profile.creator.id is already a string
  if(profile.creator.id !== req.userData.userId){
    const error = new HttpError(
      'You are not allowed to delete this profile.',
      401
    );
    // return error if unauthorized to update profile
    return next(error);
  }

  // Try removing note from notes collection and remove the note from creator's notes array
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await profile.remove({session: sess});
    profile.creator.profile = null;   // we are able to do this because of populated the place object
    //await profile.creator.save({session: sess});
    await profile.creator.remove({session: sess})
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'Deleted profile.' });
};

const updateProfileExperience = async (req, res, next) => {
  // Check for any validation errors
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const {
    title,
    company,
    location,
    from, 
    to,
    current,
    description
  } = req.body;

  // create new object from user submitted data
  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }

  //Search DB
  let profile;
  try {
    profile = await Profile.findOne({ creator: req.userData.userId });
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete profile.',
      500
    );
    return next(error);
  }

  if (!profile) {
    const error = new HttpError('Could not find profile for this id.', 404);
    return next(error);
  }

  // Try to Update profile with added experience
  try {
    profile.experience.unshift(newExp);     // unshift will put object in front of the array
    await profile.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update experience.',
      500
    );
    return next(error);
  }
  res.status(200).json({ profile: profile.toObject({ getters: true }) });
}

const deleteProfileExperience = async (req, res, next) => {

  //Search DB
  let profile;
  try {
    profile = await Profile.findOne({ creator: req.userData.userId });
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete profile experience.',
      500
    );
    return next(error);
  }

  if (!profile) {
    const error = new HttpError('Could not find profile for this id.', 404);
    return next(error);
  }

  try {

   // Get remove index
   const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
   
   // remove the experience from array of experience
   profile.experience.splice(removeIndex);

   await profile.save();

  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete profile experience.',
      500
    );
    return next(error);
  }
  res.status(200).json({ profile: profile.toObject({ getters: true }) });
};

const updateProfileEducation = async (req, res, next) => {
  // Check for any validation errors
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const {
    school,
    degree,
    fieldofstudy,
    from, 
    to,
    current,
    description
  } = req.body;

  // create new object from user submitted data
  const newEdu = {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  }

  //Search DB
  let profile;
  try {
    profile = await Profile.findOne({ creator: req.userData.userId });
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find profile.',
      500
    );
    return next(error);
  }

  if (!profile) {
    const error = new HttpError('Could not find profile for this id.', 404);
    return next(error);
  }

  // Try to Update profile with added experience
  try {
    profile.education.unshift(newEdu);     // unshift will put object in front of the array
    await profile.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update education.',
      500
    );
    return next(error);
  }
  res.status(200).json({ profile: profile.toObject({ getters: true }) });
};

const deleteProfileEducation = async (req, res, next) => {

  //Search DB
  let profile;
  try {
    profile = await Profile.findOne({ creator: req.userData.userId });
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete profile experience.',
      500
    );
    return next(error);
  }

  if (!profile) {
    const error = new HttpError('Could not find profile for this id.', 404);
    return next(error);
  }

  try {

   // Get remove index
   const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
   
   // remove the experience from array of experience
   profile.education.splice(removeIndex);

   await profile.save();

  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete profile experience.',
      500
    );
    return next(error);
  }
  res.status(200).json({ profile: profile.toObject({ getters: true }) });
};

//export pointers to the functions
exports.getMe = getMe;
exports.createProfile = createProfile;
exports.updateProfile = updateProfile;
exports.deleteProfile = deleteProfile;
exports.updateProfileExperience = updateProfileExperience;
exports.deleteProfileExperience = deleteProfileExperience;
exports.updateProfileEducation = updateProfileEducation;
exports.deleteProfileEducation = deleteProfileEducation;
exports.getAllProfiles = getAllProfiles;
exports.getProfileById = getProfileById;
const { validationResult } = require('express-validator');
const Post = require('../models/post');
const Profile = require('../models/profile');
const User = require('../models/user');
const HttpError = require('../models/http-error');

const createPost = async (req, res, next) => {
  // Check for any validation errors
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  //Extract data from incoming requests
  const { text } = req.body;

  // Check if user exist in DB
  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }

  //Create Post object based on info from req body and user
  const newPost = new Post({
    text,
    name: user.name,
    image: user.image,
    creator: req.userData.userId
  });

  try {
    await newPost.save();
  } catch (err) {
    const error = new HttpError(
      'Creating post failed, please try again. Caught trying to save post',
      500
    );
    return next(error);
  }
  res.status(201).json({ post: newPost });
};

const getAllPosts = async (req, res, next) => {
  let posts;
  try {
    posts = await Post.find().sort({ date: -1 });   // sort by date -1 (most recent first)

  } catch (err) {
    const error = new HttpError(
      'Creating post failed, please try again. Caught trying to save post',
      500
    );
    return next(error);
  }
  res.status(201).json({ posts });
}

const getPostById = async (req, res, next) => {
  const postId = req.params.pid;

  // Search DB
  let post;
  try {
    //get back a mongoose object
    post = await Post.findById(postId);
  } catch (err) {
    //error will be caught if get request has problem
    const error = new HttpError(
      'Something went wrong, could not find a post.',
      500
    );
    return next(error);
  }

  // if the provided placeId is not found in our db return error
  if (!post) {
    const error = new HttpError(
      'Could not find post for the provided id.',
      404
    );
    return next(error);
  }

  //turn our given mongoose object back to a JS object.
  res.json({ post: post.toObject({ getters: true }) });

};

const deletePost = async (req, res, next) => {
  const postId = req.params.pid;

  //Search DB
  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete post.',
      500
    );
    return next(error);
  }

  if (!post) {
    const error = new HttpError('Could not find post for this id.', 404);
    return next(error);
  }

  // Check if the place's creator matches the incoming request userId we got from the token
  // We dont need to include toString because place.creator.id is already a string
  if(post.creator.toString() !== req.userData.userId){
    const error = new HttpError(
      'You are not allowed to delete this post.',
      401
    );
    // return error if unauthorized to update place
    return next(error);
  }

  try {
    await post.remove();
  } catch (err) {
    console.error(err.message);
    const error = new HttpError(
      'Error removing posts',
      404
    );
    // return error if unauthorized to update place
    return next(error);
  }

  res.status(200).json({ message: 'Post removed' });
}

const likePost = async (req, res, next) => {
  const postId = req.params.pid;

  //Search DB
  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete post.',
      500
    );
    return next(error);
  }

  if (!post) {
    const error = new HttpError('Could not find post for this id.', 404);
    return next(error);
  }

  // Check if post has already been liked by current user
  if(post.likes.filter(like => like.user.toString() === req.userData.userId).length > 0) {    
    const error = new HttpError(
      'Error Occurred. Post has already been liked.',
      400
    );
    return next(error);
  }

  try {

    post.likes.unshift({ user: req.userData.userId});

    await post.save();

  } catch (err) {
    const error = new HttpError(
      'Error Occurred. Please try again later',
      500
    );
    return next(error);
  }
  res.json({ likes: post.likes.toObject({ getters: true }) });
  //res.json(post.likes);
}

const unlikePost = async (req, res, next) => {
  const postId = req.params.pid;

  //Search DB
  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete post.',
      500
    );
    return next(error);
  }

  if (!post) {
    const error = new HttpError('Could not find post for this id.', 404);
    return next(error);
  }

  // Check if post has already been liked by current user
  if(post.likes.filter(like => like.user.toString() === req.userData.userId).length === 0) {    
    const error = new HttpError(
      'Error Occurred. Post has not been liked by current user.',
      400
    );
    return next(error);
  }

  try {

    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.userData.userId)
    post.likes.splice(removeIndex, 1);

    await post.save();

  } catch (err) {
    const error = new HttpError(
      'Error Occurred. Please try again later',
      500
    );
    return next(error);
  }
  res.json({ likes: post.likes.toObject({ getters: true }) });
  //res.json(post.likes);
}

const addCommentToPost = async (req, res, next) => {
  const postId = req.params.pid;

  // Check for validation errors
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  //Extract data from incoming requests
  const { text } = req.body;

  // Check if user exist in DB
  let user;
  try {
    //user = await User.findById(req.userData.userId).isSelected('-password');
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      'Creating post failed, please try again.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }

  //Search DB
  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete post.',
      500
    );
    return next(error);
  }

  if (!post) {
    const error = new HttpError('Could not find post for this id.', 404);
    return next(error);
  }

  const newComment = {
    text,
    name: user.name,
    image: user.image,
    user: req.userData.userId
  };

  try {
    post.comments.unshift(newComment);
    await post.save();
  } catch (err) {
    const error = new HttpError(
      'Error Occurred. Please try again later',
      500
    );
    return next(error);
  }
  res.json({ comments: post.comments.toObject({ getters: true }) });
}

const deleteCommentFromPost = async (req, res, next) => {
  const postId = req.params.pid;
  const commentId = req.params.comment_id;
  //Search DB
  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete post.',
      500
    );
    return next(error);
  }

  if (!post) {
    const error = new HttpError('Could not find post for this id.', 404);
    return next(error);
  }

  //Search DB
  let comment;
  try {
    comment = await post.comments.find(comment => comment.id === commentId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete comment from post.',
      500
    );
    return next(error);
  }

  if (!comment) {
    const error = new HttpError('Comment does not exist.', 404);
    return next(error);
  }


  // Check user
  if(comment.user.toString() !== req.userData.userId) {
    return next( new HttpError('User not authorized', 401));
  }

  try {

    const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.userData.userId);

    post.comments.splice(removeIndex, 1);

    await post.save();

  } catch (err) {
    const error = new HttpError(
      'Error Occurred. Please try again later',
      500
    );
    return next(error);
  }
  res.json({ comments: post.comments.toObject({ getters: true }) });
}

exports.createPost = createPost;
exports.getAllPosts = getAllPosts;
exports.deletePost = deletePost;
exports.getPostById = getPostById;
exports.likePost = likePost;
exports.unlikePost = unlikePost;
exports.addCommentToPost = addCommentToPost;
exports.deleteCommentFromPost = deleteCommentFromPost;
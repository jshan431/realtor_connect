const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const checkAuth  = require('../middleware/check-auth');
const postsController = require('../controllers/posts-controllers');

// middleware that checks for valid token. Subsequent routes cannot be reached without valid token
router.use(checkAuth);

// @route  POST api/posts
// @desc   Creating a post
// @access Private
router.post('/', 
  [
    check('text', 'Text is required').not().isEmpty()
  ],
  postsController.createPost
);


// @route  GET api/posts
// @desc   Get all posts
// @access Private   -    might change to Public instead
router.get('/', postsController.getAllPosts);


// @route  GET api/posts/:id
// @desc   Get post by id
// @access Private   -    might change to Public instead
router.get('/:pid', postsController.getPostById);

// @route  DELETE api/posts/:id
// @desc   Delete post by id
// @access Private   -    might change to Public instead
router.delete('/:pid', postsController.deletePost);


// @route  PUT api/posts/like/:id
// @desc   Like a post
// @access Private  
router.put('/like/:pid', postsController.likePost);

// @route  PUT api/posts/unlike/:id
// @desc   Like a post
// @access Private  
router.put('/unlike/:pid', postsController.unlikePost);


// @route  POST api/posts/comment/:id
// @desc   Comment on a post
// @access Private
router.post('/comment/:pid', 
  [ 
    check('text', 'Text is required').not().isEmpty()
  ], 
  postsController.addCommentToPost
);

// @route  DELETE api/posts/comment/:id/:comment_id
// @desc   Delete comment
// @access Private   -
router.delete('/comment/:pid/:comment_id', postsController.deleteCommentFromPost);

module.exports = router;
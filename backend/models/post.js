const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  creator: {
    type: mongoose.Types.ObjectId, required: true, ref: 'User'
  },
  text: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  image: {
    type: String
  },
  likes: [
    {
      user: {
        type: mongoose.Types.ObjectId, required: true, ref: 'User'
      }
    }
  ],
  comments: [
    {
      user: {
        type: mongoose.Types.ObjectId, required: true, ref: 'User'
      },
      text: {
        type: String,
        required: true
      },
      name: {
        type: String
      },
      image: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', postSchema);
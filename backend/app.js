const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const usersRoutes = require('./routes/users-routes');
const placesRoutes = require('./routes/places-routes');
const profilesRoutes = require('./routes/profiles-routes');
const postsRoutes = require('./routes/posts-routes');
const HttpError = require('./models/http-error');
const app = express();

//parse the body of incoming request of JSON format and convert it to JS
app.use(bodyParser.json());

// Prevent CORS errors
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

// routing middlewares
app.use('/api/users', usersRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/posts', postsRoutes);

//handle unwanted request 
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

// error handling middleware 
app.use((error, req, res, next) => {

  //check if res was already sent, return because we don't want to resend
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});


// Establish connection with DB and then start up our server
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-t7ifn.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    //'mongodb+srv://jack123:jack123@cluster0-t7ifn.mongodb.net/test?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    }
  )
  .then(() => {
    app.listen(5000);
    console.log('Running on Port 5000');
  })
  .catch(err => {
    console.log(err);
  });
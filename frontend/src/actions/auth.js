import axios from 'axios';
import { setAlert } from './alert';
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_PROFILE
} from './types';

import setAuthToken from '../utils/setAuthToken';

// Load User
export const loadUser = () => async dispatch => {
  if(localStorage.token) {
    setAuthToken(localStorage.token);
  } 
  try {
    const res = await axios.get('http://localhost:5000/api/users/getuser');
    dispatch({
      type: USER_LOADED,
      payload: res.data     // data contains the user object
    });
  } catch (err) { 
    dispatch({
      type: AUTH_ERROR
    });
  }
};

// Register User
export const register = ({ name, email, password }) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const body = JSON.stringify({ name, email, password});    // Preparing the data to be sent as a JSON

  try {
    const res = await axios.post('http://localhost:5000/api/users/signup', body, config);     // send post request and await the response
    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data       // data is an object that holds the {userId, email, token}
    });
    dispatch(loadUser());     // dispatch functions like so 
  } catch (err) {
    // show alerts if there are errors
    const errors = err.response.data.errors;
    if(errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({
      type: REGISTER_FAIL
    });
  }

};

// Login User
export const login = (email, password) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const body = JSON.stringify({ email, password});    // Preparing the data to be sent

  try {
    const res = await axios.post('http://localhost:5000/api/users/login', body, config);
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data       // data holds the token
    });

    dispatch(loadUser());

  } catch (err) {
    // show alerts if there are errors
    const errors = err.response.data.errors;
    if(errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({
      type: LOGIN_FAIL
    });
  }

};

// Logout / Clear Profile
export const logout = () => dispatch => {
  dispatch({ type: CLEAR_PROFILE});
  dispatch({ type: LOGOUT});
}
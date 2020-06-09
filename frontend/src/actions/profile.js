import axios from 'axios';
import { setAlert } from './alert';

import {
  GET_PROFILE,
  PROFILE_ERROR,
  UPDATE_PROFILE,
  ACCOUNT_DELETED,
  CLEAR_PROFILE,
  GET_PROFILES
} from './types';

// Get current users profile
export const getCurrentProfile = () =>  async dispatch => {
  try {
    // await get request which returns a profile
    const res = await axios.get('http://localhost:5000/api/profiles/me');
    console.log(res.data);
    dispatch({
      type: GET_PROFILE,
      payload: res.data
    });
  } catch (err) {
    console.log(err);
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
}

// Get all profile
export const getProfiles = () =>  async dispatch => {
  dispatch({ type: CLEAR_PROFILE});
  try {
    const res = await axios.get('http://localhost:5000/api/profiles');
    console.log(res.data);
    dispatch({
      type: GET_PROFILES,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
}

// Get profile by ID
export const getProfileById = userId =>  async dispatch => {

  try {
    const res = await axios.get(`http://localhost:5000/api/profiles/user/${userId}`);
    dispatch({
      type: GET_PROFILE,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
}


// Create or update profile
export const createProfile = (formData, history, edit = false) => async dispatch => {
  //console.log("inside of createProfile()");
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    //console.log("inside of the try before sending requests");
    const res = await axios.post('http://localhost:5000/api/profiles', formData, config);
    //console.log("The res is:" + res);
    //console.log("inside of the try after sending requests");
    dispatch({
      type: GET_PROFILE,
      payload: res.data
    });
    //console.log("After dispatching");
    //console.log("Before dispatching Alert");
    dispatch(setAlert( edit ? 'Profile Updated' : 'Profile Created', 'success'));
    //console.log("After dispatching Alert");
    if(!edit) {
      history.push('/dashboard');
    }

  } catch (err) {
    console.log('err.response' + err.response);
    // show alerts if there are errors
    const errors = err.response.data.errors;
    if(errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }

    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Delete account and profile
export const deleteAccount = (profileId) => async dispatch => {
  
  if(window.confirm('Are you sure? This can Not be undone!')){
    try {
      await axios.delete(`http://localhost:5000/api/profiles/${profileId}`);

      dispatch({
        type: CLEAR_PROFILE
      });

      dispatch({
        type: ACCOUNT_DELETED
      });
  
      dispatch(setAlert('Your account has been permanantly removed'));
  
    } catch (err) {
      dispatch({
        type: PROFILE_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status }
      });
    }
  }
  
};

// Add Education
export const addEducation = (formData, history) => async dispatch => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    const res = await axios.put('http://localhost:5000/api/profiles/education', formData, config);

    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data
    });

    dispatch(setAlert('Education Added', 'success'));
    
    history.push('/dashboard');

  } catch (err) {
    // show alerts if there are errors
    const errors = err.response.data.errors;
    if(errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }

    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Add Experience
export const addExperience = (formData, history) => async dispatch => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    const res = await axios.put('http://localhost:5000/api/profiles/experience', formData, config);

    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data
    });

    dispatch(setAlert('Experience Added', 'success'));
    
    history.push('/dashboard');

  } catch (err) {
    // show alerts if there are errors
    const errors = err.response.data.errors;
    if(errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }

    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Delete experience
export const deleteExperience = id => async dispatch => {
  try {
    const res = await axios.delete(`http://localhost:5000/api/profiles/experience/${id}`);
    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data
    });

    dispatch(setAlert('Experience Removed', 'success'));

  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Delete education
export const deleteEducation = id => async dispatch => {
  try {
    const res = await axios.delete(`http://localhost:5000/api/profiles/education/${id}`);
    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data
    });

    dispatch(setAlert('Education Removed', 'success'));

  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};
import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';
import profile from './profile';
import post from './post';
import property from './property';

export default combineReducers({
  auth,
  alert,
  profile,
  post,
  property
});
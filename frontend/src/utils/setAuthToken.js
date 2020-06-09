import axios from 'axios';

// Adding global header
const setAuthToken = token => {
  // If there is a token in local storage
  if(token) {
    //axios.defaults.headers.common['x-auth-token'] = token;    // send with every request
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;    // send with every request
  } else {
    //delete axios.defaults.headers.common['x-auth-token'];
    delete axios.defaults.headers.common['Authorization'];
  }
}

export default setAuthToken;
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const Alert = ({ alerts }) => alerts !== null && alerts.map(alert => (        
  <div key={alert.id} className={`alert alert-${alert.alertType}`}>
    { alert.msg }
  </div>
));

Alert.propTypes = {
  alerts: PropTypes.array.isRequired
}

// tap into the redux state, grab the alert then set it to this components props as alerts
const mapStateToProps = state => ({         
  alerts: state.alert
});

export default connect(mapStateToProps)(Alert);
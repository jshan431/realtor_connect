import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

const ProfileAbout = ({ profile: { bio, creator: { name }}}) => {
  return (
    <div class="profile-about bg-light p-2">
      {
        bio && (
          <Fragment>
            <h2 class="text-primary">{name.trim().split(' ')[0]}'s Bio</h2>
            <p>
              {bio}
            </p>
            <div class="line"></div>
          </Fragment>
        )
      }
    </div>
  );
};

ProfileAbout.propTypes = {
  profile: PropTypes.object.isRequired
}

export default ProfileAbout;
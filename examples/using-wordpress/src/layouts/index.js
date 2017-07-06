import React from 'react';
import PropTypes from 'prop-types';

class DefaultLayout extends React.Component {

  render() {
    return (
      <div>
        {this.props.children()}
      </div>
    )
  }
}

DefaultLayout.propTypes = {
  location: PropTypes.object.isRequired,
}

export default DefaultLayout;

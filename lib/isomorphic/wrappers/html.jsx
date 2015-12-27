import React, {PropTypes} from 'react';

module.exports = React.createClass({
  propTypes: {
    page: PropTypes.shape({
      data: PropTypes.string
    })
  },

  render: function () {
    const html = this.props.page.data;
    return (
    <div dangerouslySetInnerHTML={{__html: html}} />
    )
  }
});

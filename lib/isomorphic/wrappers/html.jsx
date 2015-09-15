import React from 'react';

module.exports = React.createClass({
  render: function() {
    var html = this.props.page.data;
    return (
      <div dangerouslySetInnerHTML={{__html: html}}/>
    );
  }
});

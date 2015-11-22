import React from 'react';

module.exports = React.createClass({
  render: function() {
    return (
      <div className="markdown">
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{__html: post.body}}/>
      </div>
    );
  }
});

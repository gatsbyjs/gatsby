import React from 'react';

module.exports = React.createClass({
  render: function() {
    var post, rhythm;
    rhythm = this.props.typography.rhythm;
    post = this.props.page.data;

    return (
      <div className="markdown">
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{__html: post.body}}/>
      </div>
    );
  }
  
});

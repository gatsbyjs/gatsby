'use strict'

import React, { PropTypes } from 'react'

module.exports = React.createClass({
  propTypes: {
    page: PropTypes.shape({
      data: PropTypes.shape({
        body: PropTypes.string.isRequired,
      }),
    }),
  },

  render () {
    const post = this.props.page.data
    return (
      <div className="markdown">
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.body }} />
      </div>
    )
  },
})

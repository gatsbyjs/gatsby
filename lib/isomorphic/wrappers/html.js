/* @flow weak */
import React from 'react';
import PropTypes from 'prop-types';

module.exports = React.createClass({
  displayName: 'Html',
  propTypes: {
    route: PropTypes.shape({
      page: PropTypes.shape({
        data: PropTypes.object,
      }),
    }),
  },

  getDefaultProps() {
    return {
      route: {
        page: {
          data: {},
        },
      },
    }
  },

  render() {
    const post = this.props.route.page.data
    return (
      <div>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>
    )
  },
})

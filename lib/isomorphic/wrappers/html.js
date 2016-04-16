import React, { PropTypes } from 'react'

module.exports = React.createClass({
  propTypes: {
    route: PropTypes.shape({
      page: PropTypes.shape({
        data: PropTypes.shape({
          body: PropTypes.string.isRequired,
        }),
      }),
    }),
  },

  render () {
    const html = this.props.route.page.data.body
    return (
      <div dangerouslySetInnerHTML={{ __html: html }} />
    )
  },
})

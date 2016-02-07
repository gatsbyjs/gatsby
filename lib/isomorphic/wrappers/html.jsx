import React, {PropTypes} from 'react'

module.exports = React.createClass({
  propTypes: {
    page: PropTypes.shape({
      data: PropTypes.shape({
        body: PropTypes.string.isRequired,
      }),
    }),
  },

  render: function () {
    const html = this.props.page.data.body
    return (
      <div dangerouslySetInnerHTML={{__html: html}} />
    )
  },
})

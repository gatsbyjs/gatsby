React = require 'react'

module.exports = React.createClass
  displayName: "HTMLWrapper"

  render: ->
    html = @props.page.data
    <div dangerouslySetInnerHTML={{__html: html}}/>


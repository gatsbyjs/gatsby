React = require 'react'

module.exports = React.createClass
  displayName: "HTMLWrapper"

  render: ->
    #html = require "../" + @props.page.requirePath
    console.log @props
    html = "<div>fix me</div>"
    <div dangerouslySetInnerHTML={{__html: html}}/>


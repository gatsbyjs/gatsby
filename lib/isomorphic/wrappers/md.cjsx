React = require 'react'

module.exports = React.createClass
  displayName: "MarkdownWrapper"

  render: ->
    {rhythm} = @props.typography
    post = @props.page.data

    <div className="markdown">
      <h1>{post.attributes.title}</h1>
      <div dangerouslySetInnerHTML={{__html: post.body}}/>
    </div>

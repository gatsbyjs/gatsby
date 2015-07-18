React = require 'react'
DocumentTitle = require 'react-document-title'

module.exports = React.createClass
  displayName: "MarkdownWrapper"

  render: ->
    {rhythm} = @props.typography
    post = @props.page.data

    <DocumentTitle title={post.title + " | #{@props.config.siteTitle}"}>
      <div className="markdown">
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{__html: post.body}}/>
      </div>
    </DocumentTitle>

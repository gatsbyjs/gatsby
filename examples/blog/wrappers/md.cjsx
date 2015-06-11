React = require 'react'
require '../css/zenburn.css'
moment = require 'moment'
DocumentTitle = require 'react-document-title'

ReadNext = require '../components/ReadNext'

module.exports = React.createClass
  displayName: "MarkdownWrapper"

  render: ->
    {rhythm} = @props.typography
    post = @props.page.data

    <DocumentTitle title="Name of blog | #{post.title}">
      <div className="markdown">
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{__html: post.body}}/>
        <em
          style={{
            display: 'block'
            marginBottom: rhythm(2)
          }}
        >
          Posted {moment(post.date).format('MMMM D, YYYY')}
        </em>
        <hr
          style={{
            marginBottom: rhythm(2)
          }}
        />
        <ReadNext post={post} {...@props}/>
        <p>
          <img
            src="/kyle-round-small-pantheon.jpg"
            style={{
              float: 'left'
              marginRight: rhythm(1/4)
              marginBottom: 0
              width: rhythm(2)
              height: rhythm(2)
            }}
          />
          <strong>{@props.config.authorName}</strong> lives and works in San Francisco building useful things. <a href="https://twitter.com/kylemathews">You should follow him on Twitter</a>
        </p>
      </div>
    </DocumentTitle>

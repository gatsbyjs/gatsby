React = require 'react'
Router = require 'react-router'
{Link} = Router
prune = require 'underscore.string/prune'
includes = require 'underscore.string/include'
find = require 'lodash/collection/find'

module.exports = React.createClass

  render: ->
    {rhythm, fontSizeToMS} = @props.typography
    readNext = @props.post.readNext
    if readNext?
      nextPost = find @props.pages, (page) -> includes page.path, readNext.slice(1, -1)
    unless nextPost
      <noscript />
    else
      nextPost = find @props.pages, (page) -> includes page.path, readNext.slice(1, -1)

      # Create prunned version of the body.
      html = nextPost.data.body
      body = prune(html.replace(/<[^>]*>/g, ''), 200)

      <div>
        <h6
          style={{
            margin: 0
            fontSize: fontSizeToMS(-1).fontSize
            lineHeight: fontSizeToMS(-1).lineHeight
            letterSpacing: -0.5
          }}
        >
          READ THIS NEXT:
        </h6>
        <h3
          style={{
            marginBottom: rhythm(1/4)
          }}
        >
          <Link
            to={nextPost.path}
            query={{readNext: true}}
          >
            {nextPost.data.title}
          </Link>
        </h3>
        <p>{body}</p>
        <hr />
      </div>


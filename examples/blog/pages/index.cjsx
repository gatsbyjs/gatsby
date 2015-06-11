React = require 'react'
Router = require 'react-router'
{RouteHandler, Link} = Router
sortBy = require 'lodash/collection/sortby'

module.exports = React.createClass
  statics:
    data: ->
      yo: true

  render: ->
    {rhythm} = @props.typography
    pageLinks = []
    for page in sortBy(@props.pages, (page) -> page.data?.date).reverse()
      title = page.data?.title || page.path
      if page.path isnt "/" and not page.data?.draft
        pageLinks.push (
          <li
            key={page.path}
            style={{
              marginBottom: rhythm(1/4)
            }}
          >
            <Link to={page.path}>{title}</Link>
          </li>
        )

    <div>
      <p
        style={{
          marginBottom: rhythm(2.5)
        }}
      >
        <img
          src="./kyle-round-small-pantheon.jpg"
          style={{
            float: 'left'
            marginRight: rhythm(1/4)
            marginBottom: 0
            width: rhythm(2)
            height: rhythm(2)
          }}
        />
        Written by <strong>{@props.config.authorName}</strong> who lives and works in San Francisco building useful things. <a href="https://twitter.com/kylemathews">You should follow him on Twitter</a>
      </p>
      <ul>
        {pageLinks}
      </ul>
    </div>

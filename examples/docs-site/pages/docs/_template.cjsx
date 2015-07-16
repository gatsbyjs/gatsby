React = require 'react'
Router = require 'react-router'
{RouteHandler, Link, State} = Router
{Container, Grid, Breakpoint, Span} = require 'react-responsive-grid'
Typography = require 'typography'
sortBy = require 'lodash/collection/sortBy'

typography = Typography()
{rhythm, fontSizeToMS} = typography

module.exports = React.createClass
  mixins: [State]
  render: ->
    {rhythm} = @props.typography
    childPages = @props.childPages.map (child) ->
      {
        title: child.data.title
        order: child.data.order
        path: child.path
      }

    childPages = sortBy childPages, (child) -> child.order

    docPages = childPages.map (child) =>
      isActive = @isActive(child.path)
      <li
        style={{
          marginBottom: rhythm(1/2)
        }}
      >
        <Link
          to={child.path}
          style={{
            textDecoration: 'none'
          }}
        >
          {if isActive then <strong>{child.title}</strong> else child.title }
        </Link>
      </li>

    <div>
      <div
        style={{
          overflowY: 'scroll'
          position: 'fixed'
          width: rhythm(8)
        }}
      >
        <ul
          style={{
            listStyle: 'none'
            marginLeft: 0
            marginTop: rhythm(1/2)
          }}
        >
          {docPages}
        </ul>
      </div>
      <div
        style={{
          padding: "0 #{rhythm(1)}"
          paddingLeft: "calc(#{rhythm(8)} + #{rhythm(1)})"
        }}
      >
        <RouteHandler typography={typography} {...@props}/>
      </div>
    </div>

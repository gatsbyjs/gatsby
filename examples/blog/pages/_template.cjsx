React = require 'react'
Router = require 'react-router'
{RouteHandler, Link} = Router
{Container, Grid, Breakpoint, Span} = require 'react-responsive-grid'
Typography = require 'typography'
require '../css/styles.css'

typography = Typography()
{rhythm, fontSizeToMS} = typography

module.exports = React.createClass
  render: ->
    if @props.state.path is "/"
      header = (
        <h1
          style={{
            fontSize: fontSizeToMS(2.5).fontSize
            lineHeight: fontSizeToMS(2.5).lineHeight
            marginBottom: rhythm(1.5)
          }}
        >
          <Link
            style={{
              textDecoration: 'none'
              color: 'inherit'
            }}
            to="/"
          >
            {@props.config.blogTitle}
          </Link>
        </h1>
      )
    else
      header = (
        <h3>
          <Link
            style={{
              textDecoration: 'none'
              color: 'inherit'
            }}
            to="/"
          >
            {@props.config.blogTitle}
          </Link>
        </h3>
      )

    <Container
      style={{
        maxWidth: rhythm(24)
        padding: "#{rhythm(2)} #{rhythm(1/2)}"
      }}
    >
      {header}
      <RouteHandler typography={typography} {...@props}/>
    </Container>


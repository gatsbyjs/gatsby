React = require 'react'
Router = require 'react-router'
{RouteHandler, Link} = Router
Markdown = require 'react-remarkable'
{Container, Grid, Breakpoint, Span} = require 'react-responsive-grid'
Typography = require 'typography'
colorPicker = require 'color-pairs-picker'

typography = Typography()
{rhythm, fontSizeToMS} = typography

module.exports = React.createClass
  render: ->
    colors = colorPicker('brown', contrast: 8)
    <div>
      <div
        style={{
          background: colors.bg
          color: colors.fg
        }}
      >
        <Container
          style={{
            maxWidth: rhythm(30)
            padding: "#{rhythm(2)} #{rhythm(1)}"
          }}
        >
          <div
            style={{
              overflow: 'hidden'
              clear: 'both'
            }}
          >
            <h1
              style={{
                color: 'inherit'
                fontSize: fontSizeToMS(2.5).fontSize
                lineHeight: fontSizeToMS(2.5).lineHeight
                marginBottom: 0
                marginRight: rhythm(2)
                float: 'left'
              }}
            >
              <Link
                style={{
                  textDecoration: 'none'
                  color: 'inherit'
                }}
                to="/"
              >
                <span style={{fontWeight: 400}}>eco</span>Thunder
              </Link>
            </h1>
            <Link
              to="/about/"
              style={{
                color: 'inherit'
                lineHeight: fontSizeToMS(2.5).lineHeight
                marginRight: rhythm(1)
              }}
            >
              about
            </Link>
            <Link
              to="/contact-us/"
              style={{
                color: 'inherit'
                lineHeight: fontSizeToMS(2.5).lineHeight
              }}
            >
              contact us
            </Link>
          </div>
        </Container>
      </div>
      <RouteHandler typography={typography} {...@props}/>
    </div>


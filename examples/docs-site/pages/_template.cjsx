React = require 'react'
Router = require 'react-router'
{RouteHandler, Link} = Router
{Container, Grid, Breakpoint, Span} = require 'react-responsive-grid'
Typography = require 'typography'
colorPairsPicker = require 'color-pairs-picker'

# Style code
require 'css/github.css'

typography = Typography()
{rhythm, fontSizeToPx} = typography

module.exports = React.createClass
  render: ->
    headerColors = colorPairsPicker('#884499')
    <div>
      <div
        style={{
          background: headerColors.bg
          color: headerColors.fg
          borderBottom: '1px solid'
          borderColor: 'rgb(200,200,200)'
        }}
      >
        <Container
          style={{
            maxWidth: 1024
            padding: "#{rhythm(1/2)}"
            paddingBottom: "calc(#{rhythm(1/2)} - 1px)"
          }}
        >
          <Grid
            columns=12
            style={{
              padding: "#{rhythm(1/2)} 0"
            }}
          >
            <Span columns=6>
              <Link
                to="/"
                style={{
                  textDecoration: 'none'
                  color: headerColors.fg
                  fontSize: fontSizeToPx("25.5px").fontSize
                }}
              >
                AlphabetJS
              </Link>
            </Span>
            <Span columns=6 last>
              <a
                style={{
                  float: 'right'
                  color: headerColors.fg
                  textDecoration: 'none'
                }}
                href="https://github.com"
              >
                Github
              </a>
              <Link
                to="/examples/"
                style={{
                  color: headerColors.fg
                  float: 'right'
                  textDecoration: 'none'
                  marginRight: rhythm(1)
                }}
              >
                Examples
              </Link>
              <Link
                to="/docs/"
                style={{
                  color: headerColors.fg
                  float: 'right'
                  textDecoration: 'none'
                  marginRight: rhythm(1)
                }}
              >
                Documentation
              </Link>
            </Span>
          </Grid>
        </Container>
      </div>
      <Container
        style={{
          maxWidth: 1024
          padding: "#{rhythm(1)} #{rhythm(1/2)}"
        }}
      >
        <RouteHandler typography={typography} {...@props}/>
      </Container>
    </div>

React = require 'react'
Router = require 'react-router'
{RouteHandler, Link, State} = Router
{Container, Grid, Breakpoint, Span} = require 'react-responsive-grid'
Typography = require 'typography'
colorPairsPicker = require 'color-pairs-picker'
chroma = require 'chroma-js'
includes = require 'underscore.string/include'
last = require 'lodash/array/last'

# Style code
require 'css/github.css'

typography = Typography()
{rhythm, fontSizeToPx} = typography

module.exports = React.createClass
  mixins: [State]
  render: ->
    headerColors = colorPairsPicker(@props.config.headerColor)
    darker = chroma(@props.config.headerColor).darken(9).hex()
    activeHeaderColors = colorPairsPicker(darker, contrast: 7)
    docsActive = includes last(@getRoutes()).path, '/docs/'
    examplesActive = includes last(@getRoutes()).path, '/examples/'

    <div>
      <div
        style={{
          background: headerColors.bg
          color: headerColors.fg
          borderBottom: '1px solid'
          borderColor: 'rgb(200,200,200)'
          marginBottom: rhythm(1.5)
        }}
      >
        <Container
          style={{
            maxWidth: 960
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
            <Span columns=4>
              <Link
                to="/"
                style={{
                  textDecoration: 'none'
                  color: headerColors.fg
                  fontSize: fontSizeToPx("25.5px").fontSize
                }}
              >
                {@props.config.siteTitle}
              </Link>
            </Span>
            <Span columns=8 last>
              <a
                style={{
                  float: 'right'
                  color: headerColors.fg
                  textDecoration: 'none'
                  marginLeft: rhythm(1/2)
                }}
                href="https://github.com/gatsbyjs/gatsby"
              >
                Github
              </a>
              <Link
                to="/examples/"
                style={{
                  background: if @isActive('/examples/') then activeHeaderColors.bg else headerColors.bg
                  color: if @isActive('/examples/') then activeHeaderColors.fg else headerColors.fg
                  float: 'right'
                  textDecoration: 'none'
                  paddingLeft: rhythm(1/2)
                  paddingRight: rhythm(1/2)
                  paddingBottom: rhythm(1)
                  marginBottom: rhythm(-1)
                  paddingTop: rhythm(1)
                  marginTop: rhythm(-1)
                }}
              >
                Examples
              </Link>
              <Link
                to="/docs/"
                style={{
                  background: if @isActive('docs-template') then activeHeaderColors.bg else headerColors.bg
                  color: if @isActive('docs-template') then activeHeaderColors.fg else headerColors.fg
                  float: 'right'
                  textDecoration: 'none'
                  paddingLeft: rhythm(1/2)
                  paddingRight: rhythm(1/2)
                  paddingBottom: rhythm(1)
                  marginBottom: rhythm(-1)
                  paddingTop: rhythm(1)
                  marginTop: rhythm(-1)
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
          maxWidth: 960
          padding: "#{rhythm(1)} #{rhythm(1/2)}"
          paddingTop: 0
        }}
      >
        <RouteHandler typography={typography} {...@props}/>
      </Container>
    </div>

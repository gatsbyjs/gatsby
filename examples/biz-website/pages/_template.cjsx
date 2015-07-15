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
    headerColors = colorPicker('brown', contrast: 8)
    footerColors = colorPicker('rgb(56, 36, 36)', contrast: 5)
    <div>
      <div
        style={{
          background: headerColors.bg
          color: headerColors.fg
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
      <div
        style={{
          background: footerColors.bg
          color: footerColors.fg
        }}
      >
        <Container
          style={{
            maxWidth: rhythm(30)
            padding: "#{rhythm(2)} #{rhythm(1)}"
          }}
        >
          <Grid
            columns=12
          >
            <Span columns=3 post=1>
              <h6
                style={{
                  color: 'inherit'
                  marginBottom: 0
                }}
              >
                Some important info
              </h6>
              <small>
                <ul style={{marginBottom: 0}}>
                  <li>About us</li>
                  <li>Contact us</li>
                  <li>Our story</li>
                  <li>Press information</li>
                </ul>
              </small>
            </Span>
            <Span columns=3 post=1>
              <h6
                style={{
                  color: 'inherit'
                  marginBottom: 0
                }}
              >
                Other important info
              </h6>
              <small>
                <ul style={{marginBottom: 0}}>
                  <li>Careers</li>
                  <li>Team</li>
                  <li>Funding</li>
                </ul>
              </small>
            </Span>
            <Span columns=3 post=1 last>
              <h6
                style={{
                  color: 'inherit'
                  marginBottom: 0
                }}
              >
                We're awesome!
              </h6>
              <small>A not very interesting narrative about why we're (kinda) awesome</small>
            </Span>
          </Grid>
        </Container>
      </div>
    </div>


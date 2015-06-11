React = require 'react'
Router = require 'react-router'
{Link} = Router
{Container, Grid, Breakpoint, Span} = require 'react-responsive-grid'
colorPicker = require 'color-pairs-picker'

module.exports = React.createClass
  render: ->
    {rhythm} = @props.typography
    colors = colorPicker('#795548', contrast: 8)
    <div>
      <Container
        style={{
          maxWidth: rhythm(30)
          padding: "#{rhythm(2)} #{rhythm(1)}"
        }}
      >
        <Grid
          columns=12
        >
          <Span columns=4>
            <h2 style={{color: 'inherit'}}>Earth-friendly!</h2>
            <p>Lorem ipsum dolor sit amet, eos tantas alienum postulant ut. At adipisci sensibus neglegentur quo.</p>
            <Link
              to="/about/"
              style={{
                color: 'inherit'
              }}
            >
              <button style=
                {{
                  border: "1px solid"
                  background: 'rgba(0,0,0,0)'
                }}
              >
                About us
              </button>
            </Link>
          </Span>
          <Span columns=7 last>
            <img
              style={{margin: 0}}
              src="./girl.jpg"
            />
          </Span>
        </Grid>
      </Container>

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
          <Grid columns=12 gutterRatio=1>
            <Span columns=4>
              <h3 style={{marginBottom: rhythm(1/2), color: 'inherit'}}>Great features!</h3>
              <p>Lorem ipsum dolor sit amet, eos tantas alienum postulant ut. At adipisci sensibus neglegentur quo.</p>
            </Span>
            <Span columns=4>
              <h3 style={{marginBottom: rhythm(1/2), color: 'inherit'}}>Low price!</h3>
              <p>Lorem ipsum dolor sit amet, eos tantas alienum postulant ut. At adipisci sensibus neglegentur quo.</p>
            </Span>
            <Span columns=4 last>
              <h3 style={{marginBottom: rhythm(1/2), color: 'inherit'}}>Guarenteed!</h3>
              <p>Lorem ipsum dolor sit amet, eos tantas alienum postulant ut. At adipisci sensibus neglegentur quo.</p>
            </Span>
          </Grid>
        </Container>
      </div>
    </div>

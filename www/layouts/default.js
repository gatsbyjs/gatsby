import React from 'react'
import { rhythm, scale } from 'utils/typography'
import logo from 'images/gatsby-monogram.jpg'
import Link from 'react-router/lib/Link'

import 'css/prism-coy.css'

// Import Futura PT typeface
import 'fonts/Webfonts/futurapt_book_macroman/stylesheet.css'
import 'fonts/Webfonts/futurapt_bookitalic_macroman/stylesheet.css'
import 'fonts/Webfonts/futurapt_demi_macroman/stylesheet.css'
import 'fonts/Webfonts/futurapt_demiitalic_macroman/stylesheet.css'

// Other fonts
import 'typeface-tex-gyre-schola'
import 'typeface-space-mono'

module.exports = React.createClass({
  propTypes () {
    return {
      children: React.PropTypes.any,
    }
  },
  render () {
    return (
      <div>
        <div
          css={{
            background: '#f4dfc6',
          }}
        >
          <div
            css={{
              maxWidth: 700,
              margin: `0 auto`,
              padding: `${rhythm(1/2)} ${rhythm(3/4)}`,
            }}
          >
            <Link
              to='/'
              style={{
                color: 'inherit',
                display: 'block',
                textDecoration: 'none',
              }}
            >
              <img
                src={logo}
                css={{
                  display: 'inline-block',
                  height: rhythm(2),
                  marginBottom: 0,
                  marginRight: rhythm(1/4),
                  verticalAlign: 'top',
                }}
              />
              <h1
                css={{
                  ...scale(4/5),
                  display: `inline-block`,
                  lineHeight: rhythm(2),
                  verticalAlign: `top`,
                  margin: 0,
                }}
              >
                Gatsby
              </h1>
            </Link>
          </div>
        </div>
        <div
          className={"main-body"}
          style={{
            maxWidth: 700,
            margin: `0 auto`,
            padding: `${rhythm(1.5)} ${rhythm(3/4)}`,
            paddingTop: 0,//rhythm(1/2),
          }}
        >
          {this.props.children}
        </div>
      </div>
    )
  },
})

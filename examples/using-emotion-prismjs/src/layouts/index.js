import React from "react"
import { Link } from "gatsby"
import PropTypes from "prop-types"
import { css } from "react-emotion"

import { rhythm } from "../utils/typography"
import "../prism-styles"

const indexContainer = css`
  max-width: ${rhythm(30)};
  margin: ${rhythm(1)} auto 0;
  padding: ${rhythm(1)};
`

const link = css`
  box-shadow: none;
  text-decoration: none;
  color: inherit;
`

class Template extends React.Component {
  render() {
    const { location, children } = this.props
    let header
    let rootPath = `/`

    if (location.pathname === rootPath) {
      header = (
        <h1>
          <Link className={link} to={`/`}>
            Using Gatsby with Emotion and PrismJS
          </Link>
        </h1>
      )
    } else {
      header = (
        <h3>
          <Link className={link} to={`/`}>
            Using Gatsby with Emotion and PrismJS
          </Link>
        </h3>
      )
    }
    return (
      <div className={indexContainer}>
        {header}
        {children()}
      </div>
    )
  }
}

Template.propTypes = {
  children: PropTypes.func,
  location: PropTypes.object,
  route: PropTypes.object,
}

export default Template

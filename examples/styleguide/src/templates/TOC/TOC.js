import React from "react"
import PropTypes from "prop-types"
import GatsbyLink from "gatsby-link"

class TOC extends React.Component {
  render() {
    const { allComponents } = this.props.pathContext
    return (
      <div>
        <h1>Component styleguide</h1>
        <ul>
          {allComponents.map(({ displayName, path }, index) => (
            <li key={index}>
              <GatsbyLink to={path}>{displayName}</GatsbyLink>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

TOC.propTypes = {
  pathContext: PropTypes.shape({
    allComponents: PropTypes.arrayOf(
      PropTypes.shape({
        displayName: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
      }).isRequired
    ).isRequired,
  }).isRequired,
}

export default TOC

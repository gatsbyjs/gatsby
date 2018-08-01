import React from "react"
import PropTypes from "prop-types"
import GatsbyLink from "gatsby-link"

class TOC extends React.Component {
  render() {
    const { allComponents } = this.props.pageContext
    return (
      <div>
        <h1>Component styleguide</h1>
        <ul>
          {allComponents.map(({ displayName, filePath }, index) => (
            <li key={index}>
              <GatsbyLink to={filePath}>{displayName}</GatsbyLink>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

TOC.propTypes = {
  pageContext: PropTypes.shape({
    allComponents: PropTypes.arrayOf(
      PropTypes.shape({
        displayName: PropTypes.string.isRequired,
        filePath: PropTypes.string.isRequired,
      }).isRequired
    ).isRequired,
  }).isRequired,
}

export default TOC

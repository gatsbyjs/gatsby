import React from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"

class TOC extends React.Component {
  render() {
    const { allComponents } = this.props.pageContext
    return (
      <div>
        <h1>Component styleguide</h1>
        <ul>
          {allComponents.map(({ displayName, filePath }, index) => (
            <li key={index}>
              <Link to={filePath}>{displayName}</Link>
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

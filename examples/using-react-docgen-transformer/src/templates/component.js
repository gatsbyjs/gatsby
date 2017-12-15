import React from "react"
import PropTypes from "prop-types"
import GatsbyLink from "gatsby-link"

class ComponentTemplate extends React.Component {
  render() {
    const { displayName } = this.props.pathContext

    return (
      <div>
        <h1>{displayName}</h1>
        <p>
          <GatsbyLink to="/components/">[index]</GatsbyLink>
        </p>
      </div>
    )
  }
}

ComponentTemplate.propTypes = {
  pathContext: PropTypes.shape({
    displayName: PropTypes.string,
  }),
}

export default ComponentTemplate

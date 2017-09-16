import React from "react"
import PropTypes from "prop-types"
import Link from "gatsby-link"

class DefaultLayout extends React.Component {
  render() {
    return (
      <div style={{ maxWidth: 650, margin: `0 auto`, padding: 10 }}>
        <h4>
          <Link to="/">Home</Link>
        </h4>
        {this.props.children()}
      </div>
    )
  }
}

DefaultLayout.propTypes = {
  location: PropTypes.object.isRequired,
}

export default DefaultLayout

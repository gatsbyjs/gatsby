import React from "react"
import PropTypes from "prop-types"
import { Route, Redirect } from "react-router"
import { navigateTo } from "gatsby-link"

let pathPrefix = ``
if (__PREFIX_PATHS__) {
  pathPrefix = __PATH_PREFIX__
}

class GatsbyRedirect extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      to: pathPrefix + props.pathContext.to,
    }
  }

  componentDidMount() {
    if (process.env.NODE_ENV === `production`) {
      navigateTo(this.state.to)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.pathContext.to !== nextProps.pathContext.to) {
      this.setState({
        to: pathPrefix + nextProps.pathContext.to,
      })
    }
    navigateTo(this.state.to)
  }

  render() {
    return (
      <Route
        path="*"
        render={() => <Redirect to={this.state.to} />}
      />
    )
  }
}

GatsbyRedirect.propTypes = {
  pathContext: PropTypes.shape({
    to: PropTypes.string.isRequired,
  }).isRequired,
}

export default GatsbyRedirect
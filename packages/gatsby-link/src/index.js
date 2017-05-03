import React from "react"
import Link from "react-router/lib/Link"
import createClass from "create-react-class"
import PropTypes from "prop-types"

let linkPrefix = ``
if (__PREFIX_LINKS__) {
  linkPrefix = __LINK_PREFIX__
}

// Use createClass instead of ES6 class as Babel spews out a ton of code
// for polyfilling classes which there's no reason to pay for this.
// A function component would be ideal but we need componentDidMount.
const GatsbyLink = createClass({
  propTypes: {
    to: PropTypes.string.isRequired,
  },
  componentDidMount() {
    // Only enable prefetching of Link resources in production and for browsers
    // that don't support service workers *cough* Safari/IE *cough*.
    if (
      (process.env.NODE_ENV === `production` &&
        !(`serviceWorker` in navigator)) ||
      window.location.protocol !== `https:`
    ) {
      const routes = window.gatsbyRootRoute
      const { createMemoryHistory } = require(`history`)
      const matchRoutes = require(`react-router/lib/matchRoutes`)
      const getComponents = require(`react-router/lib/getComponents`)

      const createLocation = createMemoryHistory().createLocation

      if (typeof routes !== `undefined`) {
        matchRoutes(
          [routes],
          createLocation(this.props.to),
          (error, nextState) => {
            if (error) {
              return console.error(error)
            }

            if (nextState) {
              getComponents(nextState)
            }
          }
        )
      }
    }
  },
  render() {
    const to = linkPrefix + this.props.to
    return <Link {...this.props} to={to} />
  },
})

module.exports = GatsbyLink

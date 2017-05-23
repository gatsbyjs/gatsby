import React from "react"
import { Link } from "react-router-dom"
import PropTypes from "prop-types"

if (typeof window !== `undefined`) {
  require(`ric`)
}

let linkPrefix = ``
if (__PREFIX_LINKS__) {
  linkPrefix = __LINK_PREFIX__
}

class GatsbyLink extends React.Component {
  propTypes: {
    to: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  }
  componentDidMount() {
    // Only enable prefetching of Link resources in production and for browsers
    // that don't support service workers *cough* Safari/IE *cough*.
    //
    // TODO also add check if user is using SW, e.g. window.caches as if
    // not we should preload here too.
    if (
      process.env.NODE_ENV === `production` &&
      (!(`serviceWorker` in window.navigator) ||
        window.location.protocol !== `https:`)
    ) {
      requestUserIdle(() => {
        ___loadScriptsForPath(this.props.to)
      })
    }
  }

  render() {
    const to = linkPrefix + this.props.to
    const { onClick, ...rest } = this.props
    return (
      <Link
        onClick={e => {
          onClick && onClick(e)
          // In production, make sure the necessary scripts are
          // loaded before continuing.
          if (process.env.NODE_ENV === `production`) {
            e.preventDefault()
            window.___navigateTo(this.props.to)
          }
        }}
        {...rest}
        to={to}
      />
    )
  }
}

GatsbyLink.contextTypes = {
  router: PropTypes.object,
}

export default GatsbyLink

export const navigateTo = pathname => {
  window.___navigateTo(pathname)
}

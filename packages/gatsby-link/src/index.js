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
    ___loader.enqueue(this.props.to)
    console.log(`mounted ${this.props.to}`)
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
          // Is this link pointing to a hash on the same page? If so,
          // just scroll there.
          const pathname = this.props.to.split(`#`).slice(0, -1).join(``)
          if (pathname === window.location.pathname) {
            const hashFragment = this.props.to.split(`#`).slice(1).join(`#`)
            const element = document.getElementById(hashFragment)
            if (element !== null) {
              element.scrollIntoView()
              return true
            }
          }

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

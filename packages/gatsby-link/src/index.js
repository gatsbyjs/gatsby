import React from "react"
import { Link } from "react-router-dom"
import PropTypes from "prop-types"

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

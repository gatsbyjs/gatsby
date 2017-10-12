/*global __PREFIX_PATHS__, __PATH_PREFIX__ */
import React from "react"
import { Link, NavLink } from "react-router-dom"
import PropTypes from "prop-types"

let pathPrefix = `/`
if (typeof __PREFIX_PATHS__ !== `undefined` && __PREFIX_PATHS__) {
  pathPrefix = __PATH_PREFIX__
}

function normalizePath(path) {
  return path.replace(/^\/\//g, `/`)
}

const NavLinkPropTypes = {
  activeClassName: PropTypes.string,
  activeStyle: PropTypes.object,
  exact: PropTypes.bool,
  strict: PropTypes.bool,
  isActive: PropTypes.func,
  location: PropTypes.object,
}

// Set up IntersectionObserver
const handleIntersection = (el, cb) => {
  const io = new window.IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (el === entry.target) {
        // Check if element is within viewport, remove listener, destroy observer, and run link callback.
        if (entry.isIntersecting) {
          io.unobserve(el)
          io.disconnect()
          cb()
        }
      }
    })
  })
  // Add element to the observer
  io.observe(el)
}

class GatsbyLink extends React.Component {
  constructor(props) {
    super()
    // Default to no support for IntersectionObserver
    let IOSupported = false
    if (typeof window !== `undefined` && window.IntersectionObserver) {
      IOSupported = true
    }

    this.state = {
      to: normalizePath(pathPrefix + props.to),
      IOSupported,
    }
    this.handleRef = this.handleRef.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.to !== nextProps.to) {
      this.setState({
        to: normalizePath(pathPrefix + nextProps.to),
      })
      // Preserve non IO functionality if no support
      if (!this.state.IOSupported) {
        ___loader.enqueue(this.state.to)
      }
    }
  }

  componentDidMount() {
    // Preserve non IO functionality if no support
    if (!this.state.IOSupported) {
      ___loader.enqueue(this.state.to)
    }
  }

  handleRef(ref) {
    if (this.state.IOSupported && ref) {
      // If IO supported and element reference found, setup Observer functionality
      handleIntersection(ref, () => {
        ___loader.enqueue(this.state.to)
      })
    }
  }

  render() {
    const { onClick, ...rest } = this.props
    let El
    if (Object.keys(NavLinkPropTypes).some(propName => this.props[propName])) {
      El = NavLink
    } else {
      El = Link
    }

    return (
      <El
        onClick={e => {
          // eslint-disable-line
          onClick && onClick(e)

          if (
            e.button === 0 && // ignore right clicks
            !this.props.target && // let browser handle "target=_blank"
            !e.defaultPrevented && // onClick prevented default
            !e.metaKey && // ignore clicks with modifier keys...
            !e.altKey &&
            !e.ctrlKey &&
            !e.shiftKey
          ) {
            // Is this link pointing to a hash on the same page? If so,
            // just scroll there.
            let pathname = this.state.to
            if (pathname.split(`#`).length > 1) {
              pathname = pathname
                .split(`#`)
                .slice(0, -1)
                .join(``)
            }
            if (pathname === window.location.pathname) {
              const hashFragment = this.state.to
                .split(`#`)
                .slice(1)
                .join(`#`)
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
              window.___navigateTo(this.state.to)
            }
          }

          return true
        }}
        {...rest}
        to={this.state.to}
        innerRef={this.handleRef}
      />
    )
  }
}

GatsbyLink.propTypes = {
  ...NavLinkPropTypes,
  to: PropTypes.string.isRequired,
  onClick: PropTypes.func,
}

GatsbyLink.contextTypes = {
  router: PropTypes.object,
}

export default GatsbyLink

export const navigateTo = pathname => {
  window.___navigateTo(normalizePath(pathPrefix + pathname))
}

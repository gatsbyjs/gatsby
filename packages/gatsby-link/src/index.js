/*global __PREFIX_PATHS__, __PATH_PREFIX__ */
import React from "react"
import { Link, NavLink } from "react-router-dom"
import PropTypes from "prop-types"
import { createLocation, createPath } from "history"

let pathPrefix = `/`
if (typeof __PREFIX_PATHS__ !== `undefined` && __PREFIX_PATHS__) {
  pathPrefix = __PATH_PREFIX__
}

export function withPrefix(path) {
  return normalizePath(pathPrefix + path)
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
        // MSEdge doesn't currently support isIntersecting, so also test for  an intersectionRatio > 0
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
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
  constructor(props, context) {
    super()
    // Default to no support for IntersectionObserver
    let IOSupported = false
    if (typeof window !== `undefined` && window.IntersectionObserver) {
      IOSupported = true
    }

    const { history } = context.router
    const to = createLocation(props.to, null, null, history.location)

    this.state = {
      path: createPath(to),
      to,
      IOSupported,
    }
    this.handleRef = this.handleRef.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.to !== nextProps.to) {
      const to = createLocation(nextProps.to, null, null, history.location)
      this.setState({
        path: createPath(to),
        to,
      })
      // Preserve non IO functionality if no support
      if (!this.state.IOSupported) {
        ___loader.enqueue(this.state.path)
      }
    }
  }

  componentDidMount() {
    // Preserve non IO functionality if no support
    if (!this.state.IOSupported) {
      ___loader.enqueue(this.state.path)
    }
  }

  handleRef(ref) {
    this.props.innerRef && this.props.innerRef(ref)

    if (this.state.IOSupported && ref) {
      // If IO supported and element reference found, setup Observer functionality
      handleIntersection(ref, () => {
        ___loader.enqueue(this.state.path)
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
            let pathname = this.state.path
            if (pathname.split(`#`).length > 1) {
              pathname = pathname
                .split(`#`)
                .slice(0, -1)
                .join(``)
            }
            if (pathname === window.location.pathname) {
              const hashFragment = this.state.path
                .split(`#`)
                .slice(1)
                .join(`#`)
              const element = document.getElementById(hashFragment)
              if (element !== null) {
                element.scrollIntoView()
                return true
              } else {
                // This is just a normal link to the current page so let's emulate default
                // browser behavior by scrolling now to the top of the page.
                window.scrollTo(0, 0)
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
  innerRef: PropTypes.func,
  onClick: PropTypes.func,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
}

GatsbyLink.contextTypes = {
  router: PropTypes.object,
}

export default GatsbyLink

export const navigateTo = to => {
  window.___navigateTo(to)
}

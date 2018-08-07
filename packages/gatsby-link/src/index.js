/*global __PATH_PREFIX__ */
import PropTypes from "prop-types"
import React from "react"
import { Link, Location } from "@reach/router"
import { parsePath } from "gatsby"

export function withPrefix(path) {
  return normalizePath(`${__PATH_PREFIX__}/${path}`)
}

function normalizePath(path) {
  return path.replace(/\/+/g, `/`)
}

const NavLinkPropTypes = {
  activeClassName: PropTypes.string,
  activeStyle: PropTypes.object,
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
  constructor(props) {
    super()
    // Default to no support for IntersectionObserver
    let IOSupported = false
    if (typeof window !== `undefined` && window.IntersectionObserver) {
      IOSupported = true
    }

    const { location } = props

    this.state = {
      IOSupported,
      location,
    }
    this.handleRef = this.handleRef.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    // Preserve non IO functionality if no support
    if (this.props.to !== prevProps.to && !this.state.IOSupported) {
      ___loader.enqueue(parsePath(this.props.to).pathname)
    }
  }

  componentDidMount() {
    // Preserve non IO functionality if no support
    if (!this.state.IOSupported) {
      ___loader.enqueue(parsePath(this.props.to).pathname)
    }
  }

  handleRef(ref) {
    this.props.innerRef && this.props.innerRef(ref)

    if (this.state.IOSupported && ref) {
      // If IO supported and element reference found, setup Observer functionality
      handleIntersection(ref, () => {
        ___loader.enqueue(parsePath(this.props.to).pathname)
      })
    }
  }

  defaultGetProps = ({ isCurrent }) => {
    if (isCurrent) {
      return {
        className: [this.props.className, this.props.activeClassName]
          .filter(Boolean)
          .join(` `),
        style: { ...this.props.style, ...this.props.activeStyle },
      }
    }
    return null
  }

  render() {
    const {
      to,
      getProps = this.defaultGetProps,
      onClick,
      onMouseEnter,
      location,
      /* eslint-disable no-unused-vars */
      activeClassName: $activeClassName,
      activeStyle: $activeStyle,
      ref: $ref,
      innerRef: $innerRef,
      /* eslint-enable no-unused-vars */
      ...rest
    } = this.props

    return (
      <Link
        to={to}
        getProps={getProps}
        innerRef={this.handleRef}
        onMouseEnter={e => {
          // eslint-disable-line
          onMouseEnter && onMouseEnter(e)
          ___loader.hovering(parsePath(to).pathname)
        }}
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
            e.preventDefault()
            // Is this link pointing to a hash on the same page? If so,
            // just scroll there.
            const { pathname, hash } = parsePath(to)
            if (pathname === location.pathname) {
              const element = hash
                ? document.getElementById(hash.substr(1))
                : null
              if (element !== null) {
                element.scrollIntoView()
              } else {
                // This is just a normal link to the current page so let's emulate default
                // browser behavior by scrolling now to the top of the page.
                window.scrollTo(0, 0)
              }
            }

            // Make sure the necessary scripts and data are
            // loaded before continuing.
            push(to)
          }

          return true
        }}
        {...rest}
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

// eslint-disable-next-line react/display-name
const withLocation = Comp => props => (
  <Location>
    {({ location }) => <Comp location={location} {...props} />}
  </Location>
)

export default withLocation(GatsbyLink)

export const push = to => {
  window.___push(to)
}

export const replace = to => {
  window.___replace(to)
}

// TODO: Remove navigateTo for Gatsby v3
export const navigateTo = to => {
  console.warn(
    `The "navigateTo" method is now deprecated and will be removed in Gatsby v3. Please use "push" instead.`
  )
  return push(to)
}

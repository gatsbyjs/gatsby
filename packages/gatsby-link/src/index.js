import PropTypes from "prop-types"
import React from "react"
import { Link, Location } from "@gatsbyjs/reach-router"
import { resolve } from "@gatsbyjs/reach-router/lib/utils"

import { parsePath } from "./parse-path"

export { parsePath }

const isAbsolutePath = path => path?.startsWith(`/`)

export function withPrefix(path, prefix = getGlobalBasePrefix()) {
  if (!isLocalLink(path)) {
    return path
  }

  if (path.startsWith(`./`) || path.startsWith(`../`)) {
    return path
  }
  const base = prefix ?? getGlobalPathPrefix() ?? `/`

  return `${base?.endsWith(`/`) ? base.slice(0, -1) : base}${
    path.startsWith(`/`) ? path : `/${path}`
  }`
}

// These global values are wrapped in typeof clauses to ensure the values exist.
// This is especially problematic in unit testing of this component.
const getGlobalPathPrefix = () =>
  process.env.NODE_ENV !== `production`
    ? typeof __PATH_PREFIX__ !== `undefined`
      ? __PATH_PREFIX__
      : undefined
    : __PATH_PREFIX__
const getGlobalBasePrefix = () =>
  process.env.NODE_ENV !== `production`
    ? typeof __BASE_PATH__ !== `undefined`
      ? __BASE_PATH__
      : undefined
    : __BASE_PATH__

const isLocalLink = path =>
  path &&
  !path.startsWith(`http://`) &&
  !path.startsWith(`https://`) &&
  !path.startsWith(`//`)

export function withAssetPrefix(path) {
  return withPrefix(path, getGlobalPathPrefix())
}

function absolutify(path, current) {
  // If it's already absolute, return as-is
  if (isAbsolutePath(path)) {
    return path
  }
  return resolve(path, current)
}

const rewriteLinkPath = (path, relativeTo) => {
  if (typeof path === `number`) {
    return path
  }
  if (!isLocalLink(path)) {
    return path
  }
  return isAbsolutePath(path) ? withPrefix(path) : absolutify(path, relativeTo)
}

const NavLinkPropTypes = {
  activeClassName: PropTypes.string,
  activeStyle: PropTypes.object,
  partiallyActive: PropTypes.bool,
}

// Set up IntersectionObserver
const createIntersectionObserver = (el, cb) => {
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
  return { instance: io, el }
}

function GatsbyLinkLocationWrapper(props) {
  return (
    <Location>
      {({ location }) => <GatsbyLink {...props} _location={location} />}
    </Location>
  )
}

class GatsbyLink extends React.Component {
  constructor(props) {
    super(props)
    // Default to no support for IntersectionObserver
    let IOSupported = false
    if (typeof window !== `undefined` && window.IntersectionObserver) {
      IOSupported = true
    }

    this.state = {
      IOSupported,
    }
    this.handleRef = this.handleRef.bind(this)
  }

  _prefetch() {
    let currentPath = window.location.pathname

    // reach router should have the correct state
    if (this.props._location && this.props._location.pathname) {
      currentPath = this.props._location.pathname
    }

    const rewrittenPath = rewriteLinkPath(this.props.to, currentPath)
    const newPathName = parsePath(rewrittenPath).pathname

    // Prefech is used to speed up next navigations. When you use it on the current navigation,
    // there could be a race-condition where Chrome uses the stale data instead of waiting for the network to complete
    if (currentPath !== newPathName) {
      ___loader.enqueue(newPathName)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Preserve non IO functionality if no support
    if (this.props.to !== prevProps.to && !this.state.IOSupported) {
      this._prefetch()
    }
  }

  componentDidMount() {
    // Preserve non IO functionality if no support
    if (!this.state.IOSupported) {
      this._prefetch()
    }
  }

  componentWillUnmount() {
    if (!this.io) {
      return
    }
    const { instance, el } = this.io

    instance.unobserve(el)
    instance.disconnect()
  }

  handleRef(ref) {
    if (this.props.innerRef && this.props.innerRef.hasOwnProperty(`current`)) {
      this.props.innerRef.current = ref
    } else if (this.props.innerRef) {
      this.props.innerRef(ref)
    }

    if (this.state.IOSupported && ref) {
      // If IO supported and element reference found, setup Observer functionality
      this.io = createIntersectionObserver(ref, () => {
        this._prefetch()
      })
    }
  }

  defaultGetProps = ({ isPartiallyCurrent, isCurrent }) => {
    if (this.props.partiallyActive ? isPartiallyCurrent : isCurrent) {
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
      /* eslint-disable no-unused-vars */
      activeClassName: $activeClassName,
      activeStyle: $activeStyle,
      innerRef: $innerRef,
      partiallyActive,
      state,
      replace,
      _location,
      /* eslint-enable no-unused-vars */
      ...rest
    } = this.props

    if (process.env.NODE_ENV !== `production` && !isLocalLink(to)) {
      console.warn(
        `External link ${to} was detected in a Link component. Use the Link component only for internal links. See: https://gatsby.dev/internal-links`
      )
    }

    const prefixedTo = rewriteLinkPath(to, _location.pathname)
    if (!isLocalLink(prefixedTo)) {
      return <a href={prefixedTo} {...rest} />
    }

    return (
      <Link
        to={prefixedTo}
        state={state}
        getProps={getProps}
        innerRef={this.handleRef}
        onMouseEnter={e => {
          if (onMouseEnter) {
            onMouseEnter(e)
          }
          ___loader.hovering(parsePath(prefixedTo).pathname)
        }}
        onClick={e => {
          if (onClick) {
            onClick(e)
          }

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

            let shouldReplace = replace
            const isCurrent = encodeURI(prefixedTo) === _location.pathname

            if (typeof replace !== `boolean` && isCurrent) {
              shouldReplace = true
            }
            // Make sure the necessary scripts and data are
            // loaded before continuing.
            window.___navigate(prefixedTo, {
              state,
              replace: shouldReplace,
            })
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
  onClick: PropTypes.func,
  to: PropTypes.string.isRequired,
  replace: PropTypes.bool,
  state: PropTypes.object,
}

export default React.forwardRef((props, ref) => (
  <GatsbyLinkLocationWrapper innerRef={ref} {...props} />
))

export const navigate = (to, options) => {
  window.___navigate(rewriteLinkPath(to, window.location.pathname), options)
}

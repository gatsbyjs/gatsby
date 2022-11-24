import PropTypes from "prop-types"
import React from "react"
import { Link as ReachRouterLink, Location } from "@gatsbyjs/reach-router"
import { parsePath } from "./parse-path"
import { isLocalLink } from "./is-local-link"
import { rewriteLinkPath } from "./rewrite-link-path"
import { withPrefix, getGlobalPathPrefix } from "./prefix-helpers"

export { parsePath, withPrefix }

export function withAssetPrefix(path) {
  return withPrefix(path, getGlobalPathPrefix())
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
        cb(entry.isIntersecting || entry.intersectionRatio > 0)
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
    this.abortPrefetch = null
    this.handleRef = this.handleRef.bind(this)
  }

  _prefetch() {
    let currentPath = window.location.pathname + window.location.search

    // reach router should have the correct state
    if (this.props._location && this.props._location.pathname) {
      currentPath = this.props._location.pathname + this.props._location.search
    }

    const rewrittenPath = rewriteLinkPath(this.props.to, currentPath)
    const parsed = parsePath(rewrittenPath)

    const newPathName = parsed.pathname + parsed.search

    // Prefetch is used to speed up next navigations. When you use it on the current navigation,
    // there could be a race-condition where Chrome uses the stale data instead of waiting for the network to complete
    if (currentPath !== newPathName) {
      return ___loader.enqueue(newPathName)
    }

    return undefined
  }

  componentWillUnmount() {
    if (!this.io) {
      return
    }
    const { instance, el } = this.io

    if (this.abortPrefetch) {
      this.abortPrefetch.abort()
    }

    instance.unobserve(el)
    instance.disconnect()
  }

  handleRef(ref) {
    if (
      this.props.innerRef &&
      Object.prototype.hasOwnProperty.call(this.props.innerRef, `current`)
    ) {
      this.props.innerRef.current = ref
    } else if (this.props.innerRef) {
      this.props.innerRef(ref)
    }

    if (this.state.IOSupported && ref) {
      // If IO supported and element reference found, setup Observer functionality
      this.io = createIntersectionObserver(ref, inViewPort => {
        if (inViewPort) {
          this.abortPrefetch = this._prefetch()
        } else {
          if (this.abortPrefetch) {
            this.abortPrefetch.abort()
          }
        }
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
      <ReachRouterLink
        to={prefixedTo}
        state={state}
        getProps={getProps}
        innerRef={this.handleRef}
        onMouseEnter={e => {
          if (onMouseEnter) {
            onMouseEnter(e)
          }
          const parsed = parsePath(prefixedTo)
          ___loader.hovering(parsed.pathname + parsed.search)
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

export const Link = React.forwardRef((props, ref) => (
  <GatsbyLinkLocationWrapper innerRef={ref} {...props} />
))

export const navigate = (to, options) => {
  window.___navigate(rewriteLinkPath(to, window.location.pathname), options)
}

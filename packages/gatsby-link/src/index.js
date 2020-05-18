import PropTypes from "prop-types"
import React from "react"
import { Link, Location } from "@reach/router"
import { resolve } from "@reach/router/lib/utils"

import { parsePath } from "./parse-path"

export { parsePath }

const isAbsolutePath = path => path.startsWith(`/`)

export function withPrefix(path, prefix = __BASE_PATH__) {
  if (!isLocalLink(path)) {
    return path
  }

  if (path.startsWith(`./`) || path.startsWith(`../`)) {
    return path
  }
  const base = prefix ?? __PATH_PREFIX__ ?? `/`

  return `${base?.endsWith(`/`) ? base.slice(0, -1) : base}${
    path.startsWith(`/`) ? path : `/${path}`
  }`
}

const isLocalLink = path =>
  !path.startsWith(`http://`) &&
  !path.startsWith(`https://`) &&
  !path.startsWith(`//`)

export function withAssetPrefix(path) {
  return withPrefix(path, __PATH_PREFIX__)
}

function absolutify(path, current) {
  // If it's already absolute, return as-is
  if (isAbsolutePath(path)) {
    return path
  }
  return resolve(path, current)
}

const rewriteLinkPath = (path, relativeTo) => {
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

  componentDidUpdate(prevProps, prevState) {
    // Preserve non IO functionality if no support
    if (this.props.to !== prevProps.to && !this.state.IOSupported) {
      ___loader.enqueue(
        parsePath(rewriteLinkPath(this.props.to, window.location.pathname))
          .pathname
      )
    }
  }

  componentDidMount() {
    // Preserve non IO functionality if no support
    if (!this.state.IOSupported) {
      ___loader.enqueue(
        parsePath(rewriteLinkPath(this.props.to, window.location.pathname))
          .pathname
      )
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
        ___loader.enqueue(
          parsePath(rewriteLinkPath(this.props.to, window.location.pathname))
            .pathname
        )
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
      /* eslint-enable no-unused-vars */
      ...rest
    } = this.props
    if (process.env.NODE_ENV !== `production` && !isLocalLink(to)) {
      console.warn(
        `External link ${to} was detected in a Link component. Use the Link component only for internal links. See: https://gatsby.dev/internal-links`
      )
    }

    return (
      <Location>
        {({ location }) => {
          const prefixedTo = rewriteLinkPath(to, location.pathname)
          return isLocalLink(prefixedTo) ? (
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
                  const isCurrent =
                    encodeURI(prefixedTo) === window.location.pathname
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
          ) : (
            <a href={prefixedTo} {...rest} />
          )
        }}
      </Location>
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

const showDeprecationWarning = (functionName, altFunctionName, version) =>
  console.warn(
    `The "${functionName}" method is now deprecated and will be removed in Gatsby v${version}. Please use "${altFunctionName}" instead.`
  )

export default React.forwardRef((props, ref) => (
  <GatsbyLink innerRef={ref} {...props} />
))

export const navigate = (to, options) => {
  window.___navigate(rewriteLinkPath(to, window.location.pathname), options)
}

export const push = to => {
  showDeprecationWarning(`push`, `navigate`, 3)
  window.___push(rewriteLinkPath(to, window.location.pathname))
}

export const replace = to => {
  showDeprecationWarning(`replace`, `navigate`, 3)
  window.___replace(rewriteLinkPath(to, window.location.pathname))
}

// TODO: Remove navigateTo for Gatsby v3
export const navigateTo = to => {
  showDeprecationWarning(`navigateTo`, `navigate`, 3)
  return push(to)
}

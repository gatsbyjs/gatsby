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

function GatsbyLink({_location, to, innerRef, partiallyActive, className, activeClassName, style, activeStyle, target, getProps, onClick, onMouseEnter, /* eslint-disable no-unused-vars */
      activeClassName, state, replace, /* eslint-enable no-unused-vars */
      ...rest}) {
  function _prefetch() {
    let currentPath = window.location.pathname + window.location.search

    // reach router should have the correct state
    if (_location && _location.pathname) {
      currentPath = _location.pathname + _location.search
    }

    const rewrittenPath = rewriteLinkPath(to, currentPath)
    const parsed = parsePath(rewrittenPath)

    const newPathName = parsed.pathname + parsed.search

    // Prefetch is used to speed up next navigations. When you use it on the current navigation,
    // there could be a race-condition where Chrome uses the stale data instead of waiting for the network to complete
    if (currentPath !== newPathName) {
      return ___loader.enqueue(newPathName)
    }

    return undefined
  }

  function handleRef(ref) {
    if (
      innerRef &&
      Object.prototype.hasOwnProperty.call(innerRef, `current`)
    ) {
      innerRef.current = ref
    } else if (innerRef) {
      innerRef(ref)
    }

    if (IOSupported && ref) {
      // If IO supported and element reference found, setup Observer functionality
      io = createIntersectionObserver(ref, inViewPort => {
        if (inViewPort) {
          abortPrefetch = _prefetch()
        } else {
          if (abortPrefetch) {
            abortPrefetch.abort()
          }
        }
      })
    }
  }

  const defaultGetProps = ({ isPartiallyCurrent, isCurrent }) => {
    if (partiallyActive ? isPartiallyCurrent : isCurrent) {
      return {
        className: [className, activeClassName]
          .filter(Boolean)
          .join(` `),
        style: { ...style, ...activeStyle },
      }
    }
    return null
  };

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
innerRef={handleRef}
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
!target && // let browser handle "target=_blank"
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
);
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

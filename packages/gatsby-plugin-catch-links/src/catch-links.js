import { withPrefix } from "gatsby-link"

export const userIsForcingNavigation = event => (
  event.button !== 0 ||
  event.altKey ||
  event.ctrlKey ||
  event.metaKey ||
  event.shiftKey ||
  event.defaultPrevented
)

export const findClosestAnchor = event => {
  for (
    var node = event.target; 
    node.parentNode; 
    node = node.parentNode
  ) {
    if (node.nodeName.toLowerCase() === `a`) {
      return node
    }
  }

  return null
}

export const authorIsForcingNavigation = anchor => (
  /**
   * HTML5 attribute that informs the browser to handle the 
   * href as a downloadable file
   */
  anchor.hasAttribute(`download`) === true ||

  /**
   * Only catch target=_self anchors
   */
  anchor.hasAttribute(`target`) === false ||

  /* Assumption: some browsers use null for default attribute values */
  anchor.target == null ||

  /**
   * The browser defaults to _self, but, not all browsers set 
   * a.target to the string value `_self` by default
   */
  [`_self`, ``].indexOf(anchor.target) === -1
)

// https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
export const urlsAreOnSameOrigin = (origin, destination) => (
  origin.protocol === destination.protocol &&

   /* a.host includes both hostname and port in the expected format host:port */
  origin.host === destination.host
)

export default function(root, cb) {
  root.addEventListener(`click`, function(ev) {
    if ( userIsForcingNavigation(ev) ) return true

    const clickedAnchor = findClosestAnchor(ev)
    if (clickedAnchor == null) return true

    if( authorIsForcingNavigation(clickedAnchor) ) return true

    // IE clears the host value if the anchor href changed after creation, e.g.
    // in React. Creating a new anchor element to ensure host value is present
    const destination = document.createElement(`a`)
    destination.href = clickedAnchor.href

    // In IE, the default port is included in the anchor host but excluded from
    // the location host.  This affects the ability to directly compare
    // location host to anchor host.  For example: http://example.com would
    // have a location.host of 'example.com' and an destination.host of
    // 'example.com:80' Creating anchor from the location.href to normalize the
    // host value.
    const origin = document.createElement(`a`)
    origin.href = window.location.href

    if ( urlsAreOnSameOrigin(origin, destination) === false ) return true

    // Don't catch links pointed to the same page but with a hash.
    if (destination.pathname === origin.pathname && destination.hash !== ``) {
      return true
    }

    // Dynamically created anchor links (href="#my-anchor") do not always have pathname on IE
    if (destination.pathname === ``) {
      return true
    }

    // Don't catch links pointed at what look like file extensions (other than
    // .htm/html extensions).
    if (destination.pathname.search(/^.*\.((?!htm)[a-z0-9]{1,5})$/i) !== -1) {
      return true
    }

    // For when pathPrefix is used in an app and there happens to be a link
    // pointing to the same domain but outside of the app's pathPrefix. For
    // example, a Gatsby app lives at https://example.com/myapp/, with the
    // pathPrefix set to `/myapp`. When adding an absolute link to the same
    // domain but outside of the /myapp path, for example, <a
    // href="https://example.com/not-my-app"> the plugin won't catch it and
    // will navigate to an external link instead of doing a pushState resulting
    // in `https://example.com/myapp/https://example.com/not-my-app`
    var re = new RegExp(`^${origin.host}${withPrefix(`/`)}`)
    if (!re.test(`${destination.host}${destination.pathname}`)) return true

    // TODO: add a check for absolute internal links in a callback or here,
    // or always pass only `${destination.pathname}${destination.hash}`
    // to avoid `https://example.com/myapp/https://example.com/myapp/here` navigation

    ev.preventDefault()

    cb(destination.getAttribute(`href`))
    return false
  })
}

import escapeStringRegexp from "escape-string-regexp"
import { withPrefix } from "gatsby"

export const userIsForcingNavigation = event =>
  event.button !== 0 ||
  event.altKey ||
  event.ctrlKey ||
  event.metaKey ||
  event.shiftKey

// IE does not include leading slash in anchor.pathname
export const slashedPathname = pathname =>
  pathname[0] === `/` ? pathname : `/${pathname}`

export const navigationWasHandledElsewhere = event => event.defaultPrevented

export const findClosestAnchor = node => {
  for (; node.parentNode; node = node.parentNode) {
    if (node.nodeName.toLowerCase() === `a`) {
      return node
    }
  }

  return null
}

export const anchorsTargetIsEquivalentToSelf = anchor =>
  /* If target attribute is not present it's treated as _self */
  anchor.hasAttribute(`target`) === false ||
  /**
   * The browser defaults to _self, but, not all browsers set
   * a.target to the string value `_self` by default
   */

  /**
   * Assumption: some browsers use null/undefined for default
   * attribute values
   */
  anchor.target == null ||
  /**
   * Some browsers use the empty string to mean _self, check
   * for actual `_self`
   */
  [`_self`, ``].includes(anchor.target) ||
  /**
   * As per https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-target
   */
  (anchor.target === `_parent` &&
    (!anchor.ownerDocument.defaultView.parent || // Assumption: This can be falsey
      anchor.ownerDocument.defaultView.parent ===
        anchor.ownerDocument.defaultView)) ||
  (anchor.target === `_top` &&
    (!anchor.ownerDocument.defaultView.top || // Assumption: This can be falsey
      anchor.ownerDocument.defaultView.top ===
        anchor.ownerDocument.defaultView))

export const authorIsForcingNavigation = anchor =>
  /**
   * HTML5 attribute that informs the browser to handle the
   * href as a downloadable file; let the browser handle it
   */
  anchor.hasAttribute(`download`) === true ||
  /**
   * Let the browser handle anything that doesn't look like a
   * target="_self" anchor
   */
  anchorsTargetIsEquivalentToSelf(anchor) === false

// https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
export const urlsAreOnSameOrigin = (origin, destination) =>
  origin.protocol === destination.protocol &&
  /* a.host includes both hostname and port in the expected format host:port */
  origin.host === destination.host

export const pathIsNotHandledByApp = (destination, pathStartRegEx) => {
  const pathFileExtensionRegEx = /^.*\.((?!htm)[a-z0-9]{1,5})$/i

  return (
    /**
     * For when pathPrefix is used in an app and there happens to be a link
     * pointing to the same domain but outside of the app's pathPrefix. For
     * example, a Gatsby app lives at https://example.com/myapp/, with the
     * pathPrefix set to `/myapp`. When adding an absolute link to the same
     * domain but outside of the /myapp path, for example, `<a
     * href="https://example.com/not-my-app">` the plugin won't catch it and
     * will navigate to an external link instead of doing a pushState resulting
     * in `https://example.com/myapp/https://example.com/not-my-app`
     */
    pathStartRegEx.test(slashedPathname(destination.pathname)) === false ||
    /**
     * Don't catch links pointed at what look like file extensions (other than
     * .htm/html extensions).
     */
    destination.pathname.search(pathFileExtensionRegEx) !== -1
  )
}

export const hashShouldBeFollowed = (origin, destination) =>
  destination.hash !== `` &&
  /**
   * Dynamically created anchor links (href="#my-anchor") do not always
   * have pathname on IE
   */
  (destination.pathname === `` ||
    /* Don't catch links pointed to the same page but with a hash. */
    destination.pathname === origin.pathname)

export const routeThroughBrowserOrApp =
  (hrefHandler, pluginOptions) => event => {
    if (window.___failedResources) return true

    if (userIsForcingNavigation(event)) return true

    if (navigationWasHandledElsewhere(event)) return true

    const clickedAnchor = findClosestAnchor(event.target)
    if (clickedAnchor == null) return true

    if (authorIsForcingNavigation(clickedAnchor)) return true

    // IE clears the host value if the anchor href changed after creation, e.g.
    // in React. Creating a new anchor element to ensure host value is present
    const destination = document.createElement(`a`)

    // https://html.spec.whatwg.org/multipage/links.html#concept-hyperlink-url-set
    // If clickedAnchor has no href attribute like `<a>example</a>`, the href getter returns empty string.
    if (clickedAnchor.href !== ``) {
      destination.href = clickedAnchor.href
    }

    if (
      `SVGAnimatedString` in window &&
      clickedAnchor.href instanceof SVGAnimatedString
    ) {
      destination.href = clickedAnchor.href.animVal
    }

    // In IE, the default port is included in the anchor host but excluded from
    // the location host.  This affects the ability to directly compare
    // location host to anchor host.  For example: http://example.com would
    // have a location.host of 'example.com' and an destination.host of
    // 'example.com:80' Creating anchor from the location.href to normalize the
    // host value.
    const origin = document.createElement(`a`)
    origin.href = window.location.href

    if (urlsAreOnSameOrigin(origin, destination) === false) return true

    // Regex to test pathname against pathPrefix
    const pathStartRegEx = new RegExp(`^${escapeStringRegexp(withPrefix(`/`))}`)

    if (pathIsNotHandledByApp(destination, pathStartRegEx)) return true

    if (hashShouldBeFollowed(origin, destination)) return true

    if (pluginOptions.excludePattern) {
      const excludeRegex = new RegExp(pluginOptions.excludePattern)
      if (excludeRegex.test(destination.pathname)) {
        return true
      }
    }

    event.preventDefault()

    // See issue #8907: destination.pathname already includes pathPrefix added
    // by gatsby-transformer-remark but gatsby-link.navigate needs href without
    const destinationPathname = slashedPathname(destination.pathname).replace(
      pathStartRegEx,
      `/`
    )

    hrefHandler(
      `${destinationPathname}${destination.search}${destination.hash}`
    )

    return false
  }

export default function (root, pluginOptions, cb) {
  const clickHandler = routeThroughBrowserOrApp(cb, pluginOptions)

  root.addEventListener(`click`, clickHandler)

  return () => root.removeEventListener(`click`, clickHandler)
}

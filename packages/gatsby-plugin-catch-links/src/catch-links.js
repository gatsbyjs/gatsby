import { withPrefix } from "gatsby-link"

module.exports = function(root, cb) {
  root.addEventListener(`click`, function(ev) {
    if (
      ev.button !== 0 ||
      ev.altKey ||
      ev.ctrlKey ||
      ev.metaKey ||
      ev.shiftKey ||
      ev.defaultPrevented
    ) {
      return true
    }

    var anchor = null
    for (var n = ev.target; n.parentNode; n = n.parentNode) {
      if (n.nodeName === `A`) {
        anchor = n
        break
      }
    }
    if (!anchor) return true

    // Don't catch links where a target (other than self) is set
    // e.g. _blank.
    if (anchor.target && anchor.target.toLowerCase() !== `_self`) return true

    // Don't catch links pointed to the same page but with a hash.
    if (anchor.pathname === window.location.pathname && anchor.hash !== ``) {
      return true
    }

    // Dynamically created anchor links (href="#my-anchor") do not always have pathname on IE
    if (anchor.pathname === ``) {
      return true
    }

    // Don't catch links pointed at what look like file extensions (other than
    // .htm/html extensions).
    if (anchor.pathname.search(/^.*\.((?!htm)[a-z0-9]{1,5})$/i) !== -1) {
      return true
    }

    // IE clears the host value if the anchor href changed after creation, e.g.
    // in React. Creating a new anchor element to ensure host value is present
    var a1 = document.createElement(`a`)
    a1.href = anchor.href

    // In IE, the default port is included in the anchor host but excluded from
    // the location host.  This affects the ability to directly compare
    // location host to anchor host.  For example: http://example.com would
    // have a location.host of 'example.com' and an anchor.host of
    // 'example.com:80' Creating anchor from the location.href to normalize the
    // host value.
    var a2 = document.createElement(`a`)
    a2.href = window.location.href

    if (a1.host !== a2.host) return true

    // For when pathPrefix is used in an app and there happens to be a link
    // pointing to the same domain but outside of the app's pathPrefix. For
    // example, a Gatsby app lives at https://example.com/myapp/, with the
    // pathPrefix set to `/myapp`. When adding an absolute link to the same
    // domain but outside of the /myapp path, for example, <a
    // href="https://example.com/not-my-app"> the plugin won't catch it and
    // will navigate to an external link instead of doing a pushState resulting
    // in `https://example.com/myapp/https://example.com/not-my-app`
    var re = new RegExp(`^${a2.host}${withPrefix(`/`)}`)
    if (!re.test(`${a1.host}${a1.pathname}`)) return true

    // TODO: add a check for absolute internal links in a callback or here,
    // or always pass only `${a1.pathname}${a1.hash}`
    // to avoid `https://example.com/myapp/https://example.com/myapp/here` navigation

    ev.preventDefault()

    cb(anchor.getAttribute(`href`))
    return false
  })
}

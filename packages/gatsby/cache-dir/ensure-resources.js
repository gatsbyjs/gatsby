import React from "react"
import PropTypes from "prop-types"
import loader from "./loader"
import shallowCompare from "shallow-compare"

let isInitialRender = true

// ensure-resources.js is the top-level component called by the
// Router. It is therefore rendered on every page navigation. It's job
// is to make sure that we have all the resources required to render
// the page for the props.location. And to fall back to a 404 page if
// necessary. Once these resources are ensured, then they are passed
// to props.children, which is actually a function that takes those
// resources and returns React components (see production-app.js).
//
// On the initial render, production-app.js will have already called
// loader.loadPage. If no resources were found, then ensure-resources
// will throw an exception, which will end the running js and result
// in only the pure HTML of the page being displayed.
//
// ## Happy Path:
//
// When a navigation occurs, navigate.js will call
// loader.loadPage. `getDerivedStateFromProps` will retrieve that data
// and return it as props. `shouldComponentUpdate` will check if those
// resources have changed, and if so, will call render.
//
// ## Page data or component blocked:
//
// This can happen for e.g if an ad blocker blocks json or js, or
// internet connection cutoff halfway through request. In this case,
// when navigation occurs, navigate.js calls loader.loadPage, which
// returns null. `getDerivedStateFromProps` updates props with null
// pageResources. `shouldComponentUpdate` sees no resources, so calls
// `retryResources`, which performs a request for the page html. If
// the html page exists, then we have a fallback, so we reload the
// entire page, resulting in the pure HTML being rendered.
//
// ## Page doesn't exist at all (404)
//
// As above, except that `retryResources` will not find html, and will
// instead call loader.load404Page(). If 404 resources exist, they are
// set on the component state, resulting in a `render` call. If not,
// then the whole above sequence will except it will try and fallback
// ot the pure 404 HTML page.
class EnsureResources extends React.Component {
  constructor(props) {
    super()
    let location = props.location
    let pageResources = loader.loadPageSync(location.pathname)
    if (!pageResources && !loader.doesPageHtmlExistSync(location.pathname)) {
      pageResources = loader.loadPageSync(`/404.html`)
    }
    this.state = {
      location: { ...location },
      pageResources,
    }
  }

  reloadPage(prevHref) {
    // Do this, rather than simply `window.location.reload()`, so that
    // pressing the back/forward buttons work - otherwise when pressing
    // back, the browser will just change the URL and expect JS to handle
    // the change, which won't always work since it might not be a Gatsby
    // page.
    const { href } = window.location
    window.history.replaceState({}, ``, prevHref)
    window.location.replace(href)
  }

  static getDerivedStateFromProps({ location }, prevState) {
    if (prevState.location.href !== location.href) {
      const pageResources = loader.loadPageSync(location.pathname)

      return {
        pageResources,
        location: { ...location },
      }
    }

    return null
  }

  hasResources(pageResources) {
    if (pageResources && pageResources.json) {
      return true
    }

    if (pageResources && process.env.NODE_ENV !== `production`) {
      return true
    }

    return false
  }

  retryResources(nextProps) {
    const { pathname } = nextProps.location

    if (!loader.loadPageSync(pathname)) {
      // Store the previous and next location before resolving resources
      const prevLocation = this.props.location
      this.nextLocation = nextProps.location

      if (loader.doesPageHtmlExistSync(pathname)) {
        this.reloadPage(prevLocation.href)
        return
      }

      // If we can't find the page resources, or its HTML, then this
      // page doesn't exist. Load the /404.html page
      loader.loadPageOr404(pathname).then(pageResources => {
        // The page may have changed since we started this, in which case doesn't update
        if (this.nextLocation !== nextProps.location) {
          return
        }

        if (this.hasResources(pageResources)) {
          this.setState({
            location: { ...window.location },
            pageResources,
          })
          return
        }

        // If we still don't have resources, reload the page.
        // (This won't happen on initial render, since shouldComponentUpdate
        // is only called when the component updates.)
        this.reloadPage(prevLocation.href)
      })
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Always return false if we're missing resources.
    if (!this.hasResources(nextState.pageResources)) {
      this.retryResources(nextProps)
      return false
    }

    // Check if the component or json have changed.
    if (this.state.pageResources !== nextState.pageResources) {
      return true
    }
    if (
      this.state.pageResources.component !== nextState.pageResources.component
    ) {
      return true
    }

    if (this.state.pageResources.json !== nextState.pageResources.json) {
      return true
    }

    // Check if location has changed on a page using internal routing
    // via matchPath configuration.
    if (
      this.state.location.key !== nextState.location.key &&
      nextState.pageResources.page &&
      (nextState.pageResources.page.matchPath ||
        nextState.pageResources.page.path)
    ) {
      return true
    }

    return shallowCompare(this, nextProps, nextState)
  }

  render() {
    if (!this.hasResources(this.state.pageResources) && isInitialRender) {
      window.___failedResources = true

      // prevent hydrating
      throw new Error(`Missing resources for ${this.state.location.pathname}`)
    }

    isInitialRender = false
    return this.props.children(this.state)
  }
}

EnsureResources.propTypes = {
  location: PropTypes.object.isRequired,
  pageResources: PropTypes.object,
}

export default EnsureResources

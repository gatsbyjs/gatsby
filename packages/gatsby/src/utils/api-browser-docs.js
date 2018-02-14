/**
 * Called when the Gatsby browser runtime first starts.
 * @example
 * exports.onClientEntry = () => {
 *   console.log("We've started!")
 *   callAnalyticsAPI()
 * }
 */
exports.onClientEntry = true

/**
 * Called when the initial (but not subsequent) render of Gatsby App is done on the client.
 * @example
 * exports.onInitialClientRender = () => {
 *   console.log("ReactDOM.render has executed")
 * }
 */
exports.onInitialClientRender = true

/**
 * Called when the user changes routes
 * @param {object} $0
 * @param {object} $0.location A location object
 * @param {object} $0.action The "action" that caused the route change
 * @example
 * exports.onRouteUpdate = ({ location }) => {
 *   console.log('new pathname', location.pathname)
 * }
 */
exports.onRouteUpdate = true

/**
 * Allow a plugin to decide if the "scroll" should update or
 * not on a route change.
 * @param {object} $0
 * @param {object} $0.prevRouterProps The previous state of the router before the route change.
 * @param {object} $0.pathname The new pathname
 */
exports.shouldUpdateScroll = true

/**
 * Allow a plugin to register a Service Worker. Should be a function that returns true.
 * @example
 * exports.registerServiceWorker = () => true
 */
exports.registerServiceWorker = true

/**
 * Allow a plugin to replace the router component e.g. to use a custom history version.
 * @param {object} $0
 * @param {object} $0.history The history instance to use in the replacement router instance
 */
exports.replaceRouterComponent = true

/**
 * Allow a plugin to replace the page and layout component renderer. This api runner can be used to
 * implement page transitions. See https://github.com/gatsbyjs/gatsby/tree/master/examples/using-page-transitions for an example of this.
 * @param {object} $0
 * @param {object} $0.props The props of the page or layout.
 * @param {object} $0.loader The gatsby loader.
 */
exports.replaceComponentRenderer = true

/**
 * Allow a plugin to replace the history object.
 */
exports.replaceHistory = true

/**
 * Allow a plugin to wrap the root component.
 * @param {object} $0
 * @param {object} $0.Root The "Root" component built by Gatsby.
 */
exports.wrapRootComponent = true

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
 * Allow a plugin to replace the router component e.g. to use a custom history version.
 * @param {object} $0
 * @param {object} $0.history The history instance to use in the replacement router instance
 */
exports.replaceRouterComponent = true

/**
 * Allow a plugin to wrap the root component.
 * @param {object} $0
 * @param {object} $0.Root The "Root" component built by Gatsby.
 */
exports.wrapRootComponent = true

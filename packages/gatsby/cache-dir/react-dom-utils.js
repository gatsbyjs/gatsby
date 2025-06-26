const map = new WeakMap()

export function reactDOMUtils() {
  const reactDomClient = require(`react-dom/client`)

  const render = (Component, el, options = {}) => {
    let root = map.get(el)
    if (!root) {
      const rootOptions = {}

      // Add React 19 error handling options if available
      if (options.onUncaughtError || options.onCaughtError) {
        rootOptions.onUncaughtError = options.onUncaughtError
        rootOptions.onCaughtError = options.onCaughtError
      }

      map.set(el, (root = reactDomClient.createRoot(el, rootOptions)))
    }
    root.render(Component)
  }

  const hydrate = (Component, el, options = {}) => {
    const root = reactDomClient.hydrateRoot(el, Component, {
      onUncaughtError: options.onUncaughtError,
      onCaughtError: options.onCaughtError,
    })
    return root
  }

  return { render, hydrate }
}

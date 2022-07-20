/* global HAS_REACT_18 */

const map = new WeakMap()

/**
 * Since react 18, render and hydrate moved to react-dom/client
 * returns correct hydrate and render function based on installed react-dom version
 */

export function reactDOMUtils() {
  let render
  let hydrate

  if (HAS_REACT_18) {
    const { createRoot, hydrateRoot } = require(`react-dom/client`)
    const { startTransition } = require(`react`)

    render = (Component, el) => {
      let root = map.get(el)
      if (!root) {
        map.set(el, (root = createRoot(el)))
      }
      root.render(Component)
    }

    hydrate = (Component, el) => {
      requestIdleCallback ? requestIdleCallback(() => {
        startTransition(() => {
          hydrateRoot(el, Component)
        })
      }) : startTransition(() => {
        hydrateRoot(el, Component)
      })
    }
  } else {
    const reactDomClient = require(`react-dom`)
    render = reactDomClient.render
    hydrate = reactDomClient.hydrate
  }

  return { render, hydrate }
}

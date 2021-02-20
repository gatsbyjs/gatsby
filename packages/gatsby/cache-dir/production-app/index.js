/**
 * Gatsby's production app entrypoint.
 *
 * `./app.js` is the entry point of a HUGE package dependency tree. Synchronously resolving this dependency
 * tree (and thus evaluating all of this JavaScript) may result in a considerable blocking time, which
 * is heavily penalized by Google's Lighthouse TBT metric.
 *
 * This file resolves this dependecy tree before evaluating `./app.js` so we don't block the JavaScript
 * main thread for more than 50ms and thus not harming lighthouse scores and thus user experience
 *
 * The trick is to use the `nextTick` function. This function is heavily based on GlobeletJS's great work
 * on https://github.com/GlobeletJS/zero-timeout and basically allows us to break big tasks into smaller ones
 * so that we don't overrun our 50ms budget
 *
 * The dependency tree resolution is broken into 4 main steps:
 * 1. Evaluate all third-party dependencies, like react-dom and router.
 * 2. Evaluate all gastby-related code
 * 3. Evaluate each plugin on it's own task, so heavy plugins (like gatsby-plugin-theme-ui) have enough time to do its thing
 * 4. Evaluate `./app.js` and any other dependency not yet imported
 *
 * From time to time we should pay attention to this file again to make sure we are not running over our
 * 50ms budget, however I think these four tasks are more than enough for the near future, specially after
 * React 17's Concurrent Mode
 */

import { nextTick } from "../next-tick"

const nextTickAsync = cb =>
  new Promise(resolve => nextTick(() => resolve(cb())))

nextTickAsync(() => {
  // evaluate all heavy dependencies
  require(`react-dom`)
  require(`@reach/router`)
  require(`@mikaelkristiansson/domready`)
  require(`gatsby-react-router-scroll`)
})
  .then(() =>
    nextTickAsync(() => {
      // evaluate Gatsby framework
      require(`gatsby`)
    })
  )
  .then(() =>
    nextTickAsync(() => {
      const plugins = require(`../api-runner-browser-plugins`)

      // Evaluate each plugin on its own task
      return Promise.all(plugins.map(plugin => nextTickAsync(plugin.plugin)))
    })
  )
  // finally evaluate and run the app
  .then(() => nextTickAsync(() => require(`./app`)))

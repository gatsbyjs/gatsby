import CMS from "netlify-cms-app"
// set global variables required by Gatsby's components
// https://github.com/gatsbyjs/gatsby/blob/deb41cdfefbefe0c170b5dd7c10a19ba2b338f6e/docs/docs/production-app.md#window-variables
// some Gatsby components require these global variables set here:
// https://github.com/gatsbyjs/gatsby/blob/deb41cdfefbefe0c170b5dd7c10a19ba2b338f6e/packages/gatsby/cache-dir/production-app.js#L28
import emitter from "gatsby/cache-dir/emitter"
window.___emitter = emitter
window.___loader = { enqueue: () => {}, hovering: () => {} }

/**
 * Load Netlify CMS automatically if `window.CMS_MANUAL_INIT` is set.
 */
// eslint-disable-next-line no-undef
if (!CMS_MANUAL_INIT) {
  CMS.init()
} else {
  console.log(
    `\`CMS_MANUAL_INIT\` flag set, skipping automatic initialization.'`
  )
}

/**
 * The stylesheet output from the modules at `modulePath` will be at `cms.css`.
 */
CMS.registerPreviewStyle(`cms.css`)

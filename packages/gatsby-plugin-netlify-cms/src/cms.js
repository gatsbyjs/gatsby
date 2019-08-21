import CMS from "netlify-cms-app"

/**
 * Load Netlify CMS automatically if `window.CMS_MANUAL_INIT` is set.
 */
if (!window.CMS_MANUAL_INIT) {
  CMS.init()
} else {
  console.log(
    `\`window.CMS_MANUAL_INIT\` flag set, skipping automatic initialization.'`
  )
}

/**
 * The stylesheet output from the modules at `modulePath` will be at `cms.css`.
 */
CMS.registerPreviewStyle(`cms.css`)

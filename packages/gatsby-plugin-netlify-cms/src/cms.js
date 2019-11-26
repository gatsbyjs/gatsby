import CMS from "netlify-cms-app"

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

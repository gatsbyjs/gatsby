import CMS from "netlify-cms"
import "netlify-cms/dist/cms.css"

// eslint-disable-next-line no-undef
if (NETLIFY_CMS_PREVIEW_STYLES_SET) {
  CMS.registerPreviewStyle(`styles.css`)
}

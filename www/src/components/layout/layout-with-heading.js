/** @jsx jsx */
import { jsx } from "theme-ui"
import PropTypes from "prop-types"

import PageHeading from "./page-heading"
import BaseLayout from "../layout"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const LayoutWithHeading = props => {
  const { children, location, pageTitle = ``, pageIcon } = props

  return (
    <BaseLayout location={location}>
      <div
        sx={{
          pb: t => t.fontSizes[10],

          [mediaQueries.md]: {
            ml: t => t.sizes.pageHeadingDesktopWidth,
            pb: 0,
          },
        }}
      >
        {pageTitle && <PageHeading title={pageTitle} icon={pageIcon} />}
        {children}
      </div>
    </BaseLayout>
  )
}

LayoutWithHeading.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object.isRequired,
  pageTitle: PropTypes.string,
  pageIcon: PropTypes.string,
}

export default LayoutWithHeading

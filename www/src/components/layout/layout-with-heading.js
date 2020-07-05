/** @jsx jsx */
import { jsx } from "theme-ui"
import PropTypes from "prop-types"

import PageHeading from "./page-heading"

export default function LayoutWithHeading({
  children,
  pageTitle = ``,
  pageIcon,
}) {
  return (
    <div
      sx={{
        pb: [9, null, 0],
        ml: [0, null, 10],
      }}
    >
      {pageTitle && <PageHeading title={pageTitle} icon={pageIcon} />}
      {children}
    </div>
  )
}

LayoutWithHeading.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object.isRequired,
  pageTitle: PropTypes.string,
  pageIcon: PropTypes.element,
}

import React from "react"

import Notes from "../components/notes"

export default ({
  pageContext: { groupedNotes, urls, breadcrumbs, siteTitle },
  ...props
}) => (
  <Notes
    directories={groupedNotes}
    files={urls}
    breadcrumbs={breadcrumbs}
    siteTitle={siteTitle}
    {...props}
  />
)

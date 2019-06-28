import React from "react"

import Notes from "../components/notes"

export default ({
  pathContext: { groupedNotes, urls, breadcrumbs },
  ...props
}) => (
  <Notes
    directories={groupedNotes}
    files={urls}
    breadcrumbs={breadcrumbs}
    {...props}
  />
)

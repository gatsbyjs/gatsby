import React from "react"

import Notes from "../components/notes"

export default ({ pathContext: { groupedNotes, urls, breadcrumbs } }) => (
  <Notes directories={groupedNotes} files={urls} breadcrumbs={breadcrumbs} />
)

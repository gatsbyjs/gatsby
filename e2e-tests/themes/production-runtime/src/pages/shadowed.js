import React from "react"

import FormattedDate from "gatsby-theme-about/src/components/date"

export default () => {
  const date = new Date(`June 28, 1993 14:39:07`)
  return <FormattedDate date={date} />
}

import React from "react"

import Date from "gatsby-theme-about/src/components/date"

export default () => {
  const dateObject = new Date(1993, 6, 28, 14, 39, 7)
  return <Date dateObject={dateObject} />
}

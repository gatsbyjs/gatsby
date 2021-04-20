import React from "react"
import Indicator from "./indicator"

export const wrapPageElement = ({ element }) => {
  if (process.env.GATSBY_PREVIEW_INDICATOR_ENABLED === `true`) {
    return <Indicator>{element}</Indicator>
  } else {
    return <>{element}</>
  }
}

import React from "react"
import Indicator from "./indicator"
import { POLLING_INTERVAL } from "./constants"

export const wrapPageElement = ({ element }) => {
  if (process.env.GATSBY_PREVIEW_INDICATOR_ENABLED === `true`) {
    return (
      <>
        <Indicator>{element}</Indicator>
      </>
    )
  } else {
    return <>{element}</>
  }
}

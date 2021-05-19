import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Indicator from "./components/Indicator"

function PreviewIndicatorRoot() {
  const [indicatorRootRef, setIndicatorRootRef] = useState()

  useEffect(() => {
    const indicatorRoot = document.createElement(`div`)
    indicatorRoot.id = `gatsby-preview-indicator`
    setIndicatorRootRef(indicatorRoot)
    document.body.appendChild(indicatorRoot)
  }, [])

  if (!indicatorRootRef) {
    return null
  }

  return createPortal(<Indicator />, indicatorRootRef)
}

export const wrapRootElement = ({ element }) => {
  if (process.env.GATSBY_PREVIEW_INDICATOR_ENABLED === `true`) {
    return (
      <>
        {element}
        <PreviewIndicatorRoot />
      </>
    )
  } else {
    return <>{element}</>
  }
}

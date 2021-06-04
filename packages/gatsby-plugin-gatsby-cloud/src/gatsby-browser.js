import React from "react"
import { createPortal } from "react-dom"
import Indicator from "./components/Indicator"

const ShadowPortal = ({ children, identifier }) => {
  const mountNode = React.useRef(null)
  const portalNode = React.useRef(null)
  const shadowNode = React.useRef(null)
  const [, forceUpdate] = React.useState()

  React.useLayoutEffect(() => {
    const ownerDocument = mountNode.current.ownerDocument
    portalNode.current = ownerDocument.createElement(identifier)
    shadowNode.current = portalNode.current.attachShadow({ mode: `open` })
    ownerDocument.body.appendChild(portalNode.current)
    forceUpdate({})
    return () => {
      if (portalNode.current && portalNode.current.ownerDocument) {
        portalNode.current.ownerDocument.body.removeChild(portalNode.current)
      }
    }
  }, [])

  return shadowNode.current ? (
    createPortal(children, shadowNode.current)
  ) : (
    <span ref={mountNode} />
  )
}

// function PreviewIndicatorRoot() {
//   const [indicatorRootRef, setIndicatorRootRef] = useState()

//   useEffect(() => {
//     const indicatorRoot = document.createElement(`div`)
//     indicatorRoot.id = `gatsby-preview-indicator`
//     setIndicatorRootRef(indicatorRoot)
//     document.body.appendChild(indicatorRoot)
//   }, [])

//   if (!indicatorRootRef) {
//     return null
//   }

//   return createPortal(<Indicator />, indicatorRootRef)
// }

export const wrapRootElement = ({ element }) => {
  if (process.env.GATSBY_PREVIEW_INDICATOR_ENABLED === `true`) {
    return (
      <>
        {element}
        <ShadowPortal identifier="gatsby-preview-indicator">
          <Indicator />
        </ShadowPortal>
      </>
    )
  } else {
    return <>{element}</>
  }
}

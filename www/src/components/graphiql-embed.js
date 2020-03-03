import React, { useState, useRef, useCallback, useLayoutEffect } from "react"

const VIDEO_RATIO = 2 / 3

const GraphiQLEmbed = ({ title, url, query }) => {
  const encodedQuery = encodeURIComponent(query)

  const [iframeWidth, setIframeWidth] = useState(0)
  const iframeRef = useRef()

  const handleResize = useCallback(
    () => setIframeWidth(iframeRef.current.clientWidth),
    [iframeRef.current]
  )

  useLayoutEffect(() => {
    handleResize()
    window.addEventListener(`resize`, handleResize)

    return () => {
      window.removeEventListener(`resize`, handleResize)
    }
  }, [iframeRef.current])

  return (
    <iframe
      ref={iframeRef}
      className="graphiql-embed"
      title={title}
      src={`${url}?query=${encodedQuery}&explorerIsOpen=false`}
      width={iframeWidth}
      height={iframeWidth * VIDEO_RATIO}
      loading="lazy"
    />
  )
}

export default GraphiQLEmbed

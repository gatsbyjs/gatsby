/** @jsx jsx */
import { jsx } from "theme-ui"
import { useRef, useState, useCallback, useEffect } from "react"
import PropTypes from "prop-types"

export default function GraphqlEmbed({ lazy, title, url, query }) {
  const ASPECT_RATIO = 2 / 3

  const [iframeWidth, setIframeWidth] = useState(0)
  const iframeRef = useRef()

  const handleResize = useCallback(
    () => setIframeWidth(iframeRef.current.clientWidth),
    [iframeRef.current]
  )

  useEffect(() => {
    handleResize()
    window.addEventListener(`resize`, handleResize)

    return () => {
      window.removeEventListener(`resize`, handleResize)
    }
  }, [iframeRef.current])

  return (
    <iframe
      height={iframeWidth * ASPECT_RATIO}
      ref={iframeRef}
      src={`${url}?query=${encodeURIComponent(query)}&explorerIsOpen=false`}
      sx={{ border: `none`, width: `100%` }}
      title={title}
      width={iframeWidth}
      {...(lazy && { loading: `lazy` })}
    />
  )
}

GraphqlEmbed.defaultProps = {
  lazy: false,
  url: `https://711808k40x.sse.codesandbox.io/___graphql`,
}

GraphqlEmbed.propTypes = {
  lazy: PropTypes.bool,
  title: PropTypes.string.isRequired,
  url: PropTypes.string,
  query: PropTypes.string.isRequired,
}

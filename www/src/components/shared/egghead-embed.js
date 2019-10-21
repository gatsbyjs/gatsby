import React, { useRef, useState, useLayoutEffect } from "react"
import PropTypes from "prop-types"

const EggheadEmbed = ({ lessonLink, lessonTitle }) => {
  const [iframeWidth, setIframeWidth] = useState(0)
  const iframeRef = useRef()

  const handleResize = () => setIframeWidth(iframeRef.current.clientWidth)

  useLayoutEffect(() => {
    handleResize()
    window.addEventListener(`resize`, handleResize)

    return () => {
      window.removeEventListener(`resize`, handleResize)
    }
  }, [iframeRef.current])

  return (
    <>
      <iframe
        ref={iframeRef}
        className="egghead-video"
        width={600}
        height={iframeWidth * 0.57}
        src={`${lessonLink}/embed`}
        title={`Video: ${lessonTitle}`}
        allowFullScreen
      />

      <p>
        <em>
          Video hosted on <a href={lessonLink}>egghead.io</a>
        </em>
        .
      </p>
    </>
  )
}

EggheadEmbed.propTypes = {
  lessonLink: PropTypes.string.isRequired,
  lessonTitle: PropTypes.string.isRequired,
}

export default EggheadEmbed

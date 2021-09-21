import React, { useRef, useState, useLayoutEffect } from "react"
import PropTypes from "prop-types"

const VIDEO_RATIO = 9 / 16

export default function EggheadEmbed ({ lessonLink, lessonTitle }) {
  const [iframeWidth, setIframeWidth] = useState(0)
  const iframeRef = useRef()


  useLayoutEffect(() => {
    const handleResize = () => setIframeWidth(iframeRef.current.clientWidth)
    // Does this need to be called here?
    handleResize()
    window.addEventListener(`resize`, handleResize)

    return () => {
      window.removeEventListener(`resize`, handleResize)
    }
  }, [iframeRef.current?.clientWidth])

  return (
    <>
      <iframe
        ref={iframeRef}
        className="egghead-video"
        width={600}
        height={iframeWidth * VIDEO_RATIO}
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

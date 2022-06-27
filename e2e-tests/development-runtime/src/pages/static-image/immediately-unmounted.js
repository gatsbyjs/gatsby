import React, { useState, useEffect } from "react"
import { StaticImage } from "gatsby-plugin-image"

const ImmediatelyUnmounted = () => {
  const [show, setShow] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setShow(false)
    }, 1)
  }, [])

  return (
    <>
      {show && (
        <StaticImage src="../../images/citrus-fruits.jpg" alt="Citrus fruits" />
      )}
    </>
  )
}

export default ImmediatelyUnmounted

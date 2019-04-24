import React, { useState, useEffect } from "react"

const LazyFeedbackWidget = () => {
  // We need to use wrapping object
  // setWidget(<func>) would execute the function
  // and we don't want that for function components
  const [{ Widget }, setWidget] = useState({ Widget: null })

  useEffect(() => {
    import(`./feedback-widget`).then(imports => {
      setWidget({ Widget: imports.default })
    })
  }, [setWidget])

  if (!Widget) {
    return null
  }

  return <Widget />
}

export default LazyFeedbackWidget

import React, { useState, useRef } from "react"
import { ToggleButton, OpenFeedbackWidgetButtonContent } from "./buttons"
import { WidgetContainer } from "./styled-elements"

const LazyFeedbackWidget = () => {
  // We need to use wrapping object
  // setWidget(<func>) would execute the function
  // and we don't want that for function components
  const [{ Widget }, setWidget] = useState({
    Widget: null,
  })

  const [wasClicked, setWasClicked] = useState(false)
  const toggleButton = useRef(null)

  const handleToggle = () => {
    setWasClicked(true)
  }

  const triggerLazyLoad = () => {
    import(`./feedback-widget`).then(imports => {
      setWidget({ Widget: imports.default })
    })
  }

  if (!Widget) {
    return (
      <WidgetContainer>
        <ToggleButton
          onMouseOver={triggerLazyLoad}
          onFocus={triggerLazyLoad}
          ref={toggleButton}
          className="feedback-trigger"
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <OpenFeedbackWidgetButtonContent />
        </ToggleButton>
      </WidgetContainer>
    )
  }

  return (
    <React.Fragment>
      <Widget initialOpen={wasClicked} toggleButton={toggleButton} />
    </React.Fragment>
  )
}

export default LazyFeedbackWidget

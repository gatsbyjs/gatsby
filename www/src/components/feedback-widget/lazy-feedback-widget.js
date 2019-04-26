import React, { useState } from "react"
import { ToggleButton, OpenFeedbackWidgetButtonContent } from "./buttons"
import { WidgetContainer } from "./styled-elements"

const LazyFeedbackWidget = () => {
  // We need to use wrapping object
  // setWidget(<func>) would execute the function
  // and we don't want that for function components
  const [{ Widget, loading }, setWidget] = useState({
    Widget: null,
    loading: false,
  })

  const [wasClicked, setWasClicked] = useState(false)
  const [wasFocused, setWasFocused] = useState(false)

  const handleToggle = () => {
    setWasClicked(true)
    setTimeout(() => {
      // if we didn't load widget within 1 second, show loading indicator
      setWidget(state => {
        if (!state.Widget) {
          return {
            loading: true,
          }
        }
        return state
      })
    }, 1000)
  }

  const triggerLazyLoad = () => {
    import(/* webpackChunkName: "feedback-widget" */ `./feedback-widget`).then(
      imports => {
        setWidget({ Widget: imports.default, loading: false })
      }
    )
  }

  if (!Widget) {
    return (
      <WidgetContainer>
        <ToggleButton
          onMouseOver={triggerLazyLoad}
          onFocus={() => {
            setWasFocused(true)
            triggerLazyLoad()
          }}
          onBlur={() => {
            setWasFocused(false)
          }}
          className="feedback-trigger"
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <OpenFeedbackWidgetButtonContent loading={loading} />
        </ToggleButton>
      </WidgetContainer>
    )
  }

  return <Widget initialOpened={wasClicked} initialFocused={wasFocused} />
}

export default LazyFeedbackWidget

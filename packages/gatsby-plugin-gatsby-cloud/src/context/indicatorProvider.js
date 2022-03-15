import React, { useState } from "react"
import { Provider } from "./indicatorContext"

const IndicatorProvider = ({ children }) => {
  const [cookies, setCookiesState] = useState({})
  const [shouldAskForFeedback, setShouldAskForFeedbackState] = useState()
  const setCookies = cookieState => {
    setCookiesState(data => {
      return { ...data, ...cookieState }
    })
  }
  const setShouldAskForFeedback = ask => {
    setShouldAskForFeedbackState(ask)
  }
  return (
    <Provider
      value={{
        cookies,
        shouldAskForFeedback,
        setCookies,
        setShouldAskForFeedback,
      }}
    >
      {children}
    </Provider>
  )
}

export default IndicatorProvider

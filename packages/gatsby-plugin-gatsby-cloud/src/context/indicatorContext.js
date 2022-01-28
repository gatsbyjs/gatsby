import { createContext } from "react"

const IndicatorContext = createContext({
  cookies: {},
  shouldAskForFeedBack: false,
  setShouldAskForFeedback: () => {},
  setCookies: () => {},
})

export const { Provider, Consumer } = IndicatorContext
export default IndicatorContext

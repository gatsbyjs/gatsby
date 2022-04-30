import { useCallback, useContext, useEffect, useMemo } from "react"
import { differenceInDays } from "date-fns"
import { useCookie } from "."
import {
  FEEDBACK_COOKIE_NAME,
  DAYS_BEFORE_FEEDBACK,
  INTERACTION_COOKIE_NAME,
  INTERACTIONS_BEFORE_FEEDBACK,
} from "../constants"
import IndicatorContext from "../context/indicatorContext"

const useFeedback = () => {
  const { shouldAskForFeedback, setShouldAskForFeedback } =
    useContext(IndicatorContext)
  const { cookies, getCookie } = useCookie()

  const checkForFeedback = useCallback(() => {
    const lastFeedback = getCookie(FEEDBACK_COOKIE_NAME)
    if (lastFeedback) {
      const lastFeedbackDate = new Date(lastFeedback)
      const now = new Date()
      const diffInDays = differenceInDays(now, lastFeedbackDate)
      const askForFeedback = diffInDays >= DAYS_BEFORE_FEEDBACK
      setShouldAskForFeedback(askForFeedback)
    } else {
      setShouldAskForFeedback(true)
    }
  }, [])
  const shouldShowFeedback = useMemo(() => {
    const interactionCount = cookies[INTERACTION_COOKIE_NAME]
      ? parseInt(cookies[INTERACTION_COOKIE_NAME])
      : 0
    return (
      shouldAskForFeedback && interactionCount > INTERACTIONS_BEFORE_FEEDBACK
    )
  }, [shouldAskForFeedback, cookies[INTERACTION_COOKIE_NAME]])

  useEffect(() => {
    checkForFeedback()
  }, [])
  return {
    shouldAskForFeedback,
    shouldShowFeedback,
    checkForFeedback,
  }
}

export default useFeedback

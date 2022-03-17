import React, { createContext, useState, useMemo, FC } from "react"
import { differenceInDays } from "date-fns"
import Cookies from "js-cookie"
import {
  FEEDBACK_COOKIE_NAME,
  DAYS_BEFORE_FEEDBACK,
  INTERACTION_COOKIE_NAME,
  INTERACTIONS_BEFORE_FEEDBACK,
} from "../constants"
import { EventType } from "../models/enums"

interface ITrackEventProps {
  eventType: EventType
  orgId: string
  siteId: string
  buildId: string
  name: string
}

interface IIndicatorContext {
  cookies: { [key: string]: string }
  askForFeedback: boolean
  showFeedback: boolean
  checkForFeedback: () => void
  trackEvent: (info: ITrackEventProps) => void
  setCookie: (name: string, value: string) => void
  getCookie: (name: string) => string
  removeCookie: (name: string) => void
}

const defaultState = {
  cookies: Cookies.get(),
  askForFeedback: false,
  showFeedback: false,
  checkForFeedback: (): void => {},
  trackEvent: (): void => {},
  setCookie: (): void => {},
  getCookie: (): string => ``,
  removeCookie: (): void => {},
}

const IndicatorContext = createContext<IIndicatorContext>(defaultState)

const IndicatorProvider: FC = ({ children }) => {
  const rootDomain = location.hostname
    .split(`.`)
    .reverse()
    .splice(0, 2)
    .reverse()
    .join(`.`)
  const [cookies, setCookies] = useState(defaultState.cookies)
  const [askForFeedback, setAskForFeedback] = useState(
    defaultState.askForFeedback
  )
  const setCookie = (name: string, value: string): void => {
    Cookies.set(name, value, {
      domain: rootDomain,
    })
    const newValue = { [`${name}`]: value }
    setCookies(newValue)
  }

  const getCookie = (name: string): string => Cookies.get(name)
  const removeCookie = (name: string): void => {
    Cookies.remove(name, { domain: rootDomain })
    if (name in cookies) {
      delete cookies[name]
      setCookies(cookies)
    }
  }
  const checkForFeedback = (): void => {
    const lastFeedback = getCookie(FEEDBACK_COOKIE_NAME)
    if (lastFeedback) {
      const lastFeedbackDate = new Date(lastFeedback)
      const now = new Date()
      const diffInDays = differenceInDays(now, lastFeedbackDate)
      const askForFeedback = diffInDays >= DAYS_BEFORE_FEEDBACK
      setAskForFeedback(askForFeedback)
    } else {
      setAskForFeedback(true)
    }
  }
  const showFeedback = useMemo(() => {
    const interactionCount = cookies[INTERACTION_COOKIE_NAME]
      ? parseInt(cookies[INTERACTION_COOKIE_NAME])
      : 0
    return askForFeedback && interactionCount > INTERACTIONS_BEFORE_FEEDBACK
  }, [askForFeedback, cookies[INTERACTION_COOKIE_NAME]])

  const trackEvent = async ({
    eventType,
    orgId,
    siteId,
    buildId,
    name,
  }: ITrackEventProps): Promise<void> => {
    checkForFeedback()
    if (askForFeedback) {
      const interactions = isNaN(parseInt(getCookie(INTERACTION_COOKIE_NAME)))
        ? 0
        : parseInt(getCookie(INTERACTION_COOKIE_NAME))
      setCookie(INTERACTION_COOKIE_NAME, `${interactions + 1}`)
    }
    if (process.env.GATSBY_TELEMETRY_API) {
      try {
        const body = {
          time: new Date(),
          eventType,
          componentId: `gatsby-plugin-gatsby-cloud_preview-indicator`,
          version: 1,
          componentVersion:
            process.env.GATSBY_PREVIEW_UI_APP_VERSION || `4.11.0-next.0`,
          organizationId: orgId,
          siteId,
          buildId,
          name,
        }

        await fetch(process.env.GATSBY_TELEMETRY_API, {
          mode: `cors`,
          method: `POST`,
          headers: {
            "Content-Type": `application/json`,
          },
          body: JSON.stringify(body),
        })
      } catch (e) {
        console.log(e, e.message)
      }
    }
  }

  return (
    <IndicatorContext.Provider
      value={{
        cookies,
        askForFeedback,
        showFeedback,
        checkForFeedback,
        trackEvent,
        setCookie,
        getCookie,
        removeCookie,
      }}
    >
      {children}
    </IndicatorContext.Provider>
  )
}

export default IndicatorContext
export { IndicatorProvider }

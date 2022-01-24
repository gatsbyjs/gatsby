import { useCallback, useContext, useEffect } from "react"
import Cookies from "js-cookie"
import IndicatorContext from "../context/indicatorContext"

const useCookie = () => {
  const rootDomain = location.hostname
    .split(`.`)
    .reverse()
    .splice(0, 2)
    .reverse()
    .join(`.`)

  const { cookies, setCookies } = useContext(IndicatorContext)

  const setCookie = useCallback((name, value) => {
    Cookies.set(name, value, {
      domain: rootDomain,
    })
    const newValue = { [`${name}`]: value }
    setCookies(newValue)
  }, [])

  const getCookie = useCallback(name => Cookies.get(name), [])
  const removeCookie = useCallback(name => {
    Cookies.remove(name, { domain: rootDomain })
    if (name in cookies) {
      delete cookies[name]
      setCookies(cookies)
    }
  }, [])

  useEffect(() => {
    const allCookies = Cookies.get()
    setCookies(allCookies)
  }, [])

  return {
    cookies,
    setCookie,
    getCookie,
    removeCookie,
  }
}

export default useCookie

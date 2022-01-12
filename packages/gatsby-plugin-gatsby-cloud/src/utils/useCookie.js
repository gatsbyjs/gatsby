import { useEffect, useState } from "react"
import Cookies from "js-cookie"

const useCookie = () => {
  const rootDomain = location.hostname
    .split(`.`)
    .reverse()
    .splice(0, 2)
    .reverse()
    .join(`.`)

  const [cookies, setCookies] = useState({})
  const setCookie = (name, value) => {
    Cookies.set(name, value, {
      domain: rootDomain,
    })
    const newValue = { [`${name}`]: value }
    setCookies(data => {
      return { ...data, ...newValue }
    })
  }

  const getCookie = name => Cookies.get(name)
  const removeCookie = name => {
    Cookies.remove(name, { domain: rootDomain })
    if (name in cookies) {
      delete cookies[name]
      setCookies(cookies)
    }
  }

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

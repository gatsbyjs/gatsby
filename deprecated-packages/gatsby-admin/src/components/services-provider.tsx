import React, { createContext, useContext, useState, useEffect } from "react"
import { Spinner } from "theme-ui"

type Services = Record<string, any>

const ServicesContext = createContext<Services>({})

export function ServicesProvider({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const [status, setStatus] = useState<"loading" | "idle">(`loading`)
  const [services, setServices] = useState<Services>({})

  useEffect(() => {
    setStatus(`loading`)
    fetch(`/___services`)
      .then(res => res.json())
      .then((json: Services) => {
        setServices(json)
        setStatus(`idle`)
      })
  }, [])

  if (status === `loading`) return <Spinner />

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  )
}

export const useServices = (): Services => useContext(ServicesContext)

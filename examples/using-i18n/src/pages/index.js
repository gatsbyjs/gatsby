import React from "react"
import useTranslations from "../components/useTranslations"

const Index = () => {
  // useTranslations is aware of the global context (and therefore also "locale")
  // so it'll automatically give back the right translations
  const { hello } = useTranslations()

  return (
    <>
      <h1>{hello}</h1>
    </>
  )
}

export default Index

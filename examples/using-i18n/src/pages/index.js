import React from "react"
import useTranslations from "../components/useTranslations"

const Index = () => {
  const { hello } = useTranslations()

  return (
    <>
      <h1>{hello}</h1>
    </>
  )
}

export default Index

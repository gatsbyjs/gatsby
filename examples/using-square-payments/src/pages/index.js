import React, { useEffect, useState } from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import PaymentForm, { loadSquareSdk } from "../components/paymentForm"

const IndexPage = () => {
  const [squareStatus, setSquareStatus] = useState("notLoaded")

  useEffect(() => {
    loadSquareSdk()
      .then(() => {
        setSquareStatus("SUCCESS")
      })
      .catch(() => setSquareStatus("ERROR"))
  }, []) // on mount, add the js script dynamically

  return (
    <Layout>
      <SEO title="Home" />
      <h1 style={{ textAlign: "center" }}>Thank you for purchasing </h1>
      <h2 style={{ textAlign: "center" }}>Awesome dog chew toy for $1</h2>
      {squareStatus === "notLoaded" && (
        <>
          <h3 style={{ textAlign: "center" }}>
            Please hold a moment while we're presently setting up your payment!
          </h3>
          <h3 style={{ textAlign: "center" }}>Thank you for your patience</h3>
        </>
      )}
      {squareStatus === "ERROR" && (
        <p>Failed to load SquareSDK, Please refresh the page</p>
      )}
      {squareStatus === "SUCCESS" && (
        <PaymentForm paymentForm={window.SqPaymentForm} ammount={1} />
      )}
    </Layout>
  )
}

export default IndexPage

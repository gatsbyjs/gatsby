import React from "react"
import Layout from "../components/layout"

/**
 * @param {Object} location is destructured from the internal gatsby navigation api
 */
const PaymentReciept = ({ location }) => {
  // destructures the state passed via the payment form component
  const { state } = location
  return (
    <Layout>
      <>
        <h1 style={{ textAlign: "center" }}>
          Your payment for Awesome dog chew toy for $1 was successful
        </h1>
        <h2 style={{ textAlign: "center" }}>
          Here's your payment receipt information:
        </h2>
        {!state ? (
          <h2> No payment information is present.</h2>
        ) : (
          <pre>{JSON.stringify(state.paymentInfo, null, 2)}</pre>
        )}
      </>
    </Layout>
  )
}
export default PaymentReciept

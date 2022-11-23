import React, { useEffect, useState } from "react"
import { navigate } from "gatsby"

import Layout from "../components/layout"

export default function NavigationEffects({ location }) {
  const [message, setMessage] = useState("Waiting for effect")

  const searchParam = location.search
  const searchHash = location.hash
  const searchState = location?.state?.message

  useEffect(() => {
    setMessage(searchParam)
  }, [searchParam])

  useEffect(() => {
    setMessage(searchHash)
  }, [searchHash])

  useEffect(() => {
    setMessage(searchState)
  }, [searchState])

  const handleClick = (next, options = { replace: true }) =>
    navigate(`${next}`, options)

  return (
    <Layout>
      <h1 data-testid="effect-message">{message}</h1>

      <button
        data-testid="send-search-message"
        onClick={() => handleClick("?message=searchParam")}
      >
        Send Search
      </button>
      <button
        data-testid="send-hash-message"
        onClick={() => handleClick("#message-hash")}
      >
        Send Hash
      </button>

      <button
        data-testid="send-state-message"
        onClick={() =>
          handleClick("/navigation-effects", {
            state: { message: "this is a message using the state" },
          })
        }
      >
        Send state
      </button>
    </Layout>
  )
}

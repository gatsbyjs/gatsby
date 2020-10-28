import React, { useEffect, useState } from "react"
import { navigate } from "gatsby"

import Layout from "../components/layout"

export default function NavigationEffects({ location }) {
  const [message, setMessage] = useState("Waiting for effect")

  const searchParam = location.search
  const searchHash = location.hash

  useEffect(() => {
    setMessage(searchParam)
  }, [searchParam])

  useEffect(() => {
    setMessage(searchHash)
  }, [searchHash])

  const handleClick = next => navigate(`${next}`, { replace: true })

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
    </Layout>
  )
}

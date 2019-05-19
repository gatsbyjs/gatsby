import React, { useState } from "react"

import Layout from "../components/layout"

function Hooks() {
  const [count, setCount] = useState(0)
  const increment = () => setCount(count + 1)
  const decrement = () => setCount(count - 1)
  return (
    <Layout>
      <h1 data-testid="count">{count}</h1>
      <button data-testid="decrement" onClick={decrement}>
        -
      </button>
      <button data-testid="increment" onClick={increment}>
        +
      </button>
    </Layout>
  )
}

export default Hooks

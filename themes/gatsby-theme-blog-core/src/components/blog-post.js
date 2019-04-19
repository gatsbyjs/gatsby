import React from "react"

export default props => (
  <pre style={{ whiteSpace: `pre-wrap` }}>{JSON.stringify(props, null, 2)}</pre>
)

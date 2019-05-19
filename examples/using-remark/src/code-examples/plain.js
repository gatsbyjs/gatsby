import React from "react"
import ReactDOM from "react-dom"

const name = `Brian`

ReactDOM.render(
  <div>
    <h1>Hello, ${name}!</h1>
    <h2>Welcome to this example</h2>
  </div>,
  document.getElementById(`root`)
)

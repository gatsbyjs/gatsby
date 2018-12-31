import React from "react"
import ReactDOM from "react-dom"

const name = `Brian` // highlight-line

ReactDOM.render(
  <div>
    {/* highlight-range{1-2} */}
    <h1>Hello, ${name}!</h1>
    <h2>Welcome to this example</h2>
  </div>,
  document.getElementById(`root`)
)

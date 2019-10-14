/* hide-range{1-3} */
import React from "react"
import ReactDOM from "react-dom"

// highlight-next-line
const name = `Brian`

// highlight-range{4-5}
// hide-next-line
ReactDOM.render(
  <div>
    <h1>Hello, ${name}!</h1>
    <h2>Welcome to this example</h2>
  </div>,
  document.getElementById(`root`) // hide-line
) // hide-line

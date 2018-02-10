import React from "react"
import { Link } from "gatsby"

class IndexComponent extends React.Component {
  render() {
    return (
      <div>
        <h1>Hello world</h1>
        <Link to="/page-2/">Page 2</Link>
      </div>
    )
  }
}

export default IndexComponent

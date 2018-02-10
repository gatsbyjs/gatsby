import React from "react"
import { Link } from "gatsby"

class DefaultLayout extends React.Component {
  render() {
    return (
      <div>
        <Link to="/">
          <h3>Example with no plugins</h3>
        </Link>
        <ul>
          <li>
            <Link to="/a/">a</Link>
          </li>
          <li>
            <Link to="/b/">b</Link>
          </li>
          <li>
            <Link to="/c/">c</Link>
          </li>
        </ul>
        {this.props.children()}
      </div>
    )
  }
}

export default DefaultLayout

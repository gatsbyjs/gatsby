import React, { Component } from "react"
import { Link } from "gatsby"
import Counter from "./Counter"

import DevTools from "mobx-react-devtools"

class DefaultLayout extends Component {
  render() {
    return (
      <div>
        <Link to="/">
          <h3>MobX example</h3>
        </Link>
        <DevTools />
        <Counter />
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
        {this.props.children}
      </div>
    )
  }
}
export default DefaultLayout

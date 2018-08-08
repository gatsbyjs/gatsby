import React from "react"
import { Link } from "gatsby"
import { Subscribe } from "unstated"
import CounterContainer from "../state/CounterContainer"

class DefaultLayout extends React.Component {
  render() {
    return (
      <div>
        <Link to="/">
          <h3>Unstated example</h3>
        </Link>
        <Subscribe to={[CounterContainer]}>
          {counter => (
            <div>
              <button onClick={() => counter.decrement()}>-</button>
              <span>Count: {counter.state.count}</span>
              <button onClick={() => counter.increment()}>+</button>
            </div>
          )}
        </Subscribe>
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

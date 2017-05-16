import React from "react"
import "./index.scss"

class Index extends React.Component {
  render() {
    return (
      <div>
        <h1 className="the-sass-class">
          Hi sassy friends
        </h1>
        <div className="sass-nav-example">
          <h2>Nav example</h2>
          <ul>
            <li>
              <a href="#">Store</a>
            </li>
            <li>
              <a href="#">Help</a>
            </li>
            <li>
              <a href="#">Logout</a>
            </li>
          </ul>
        </div>
      </div>
    )
  }
}

export default Index

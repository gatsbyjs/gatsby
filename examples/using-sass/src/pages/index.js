import React from "react"

class Index extends React.Component {
  render() {
    return (
      <div>
        <h1 className="tu">Hi sassy friends</h1>
        <div className="sass-nav-example">
          <h2>Nav example</h2>
          <ul className="pa0 ma0 list">
            <li>
              <a href="#">Store</a>
            </li>
            <li>
              <a href="#">Help</a>
            </li>
            <li>
              <a href="#">Logout</a>
            </li>
            <li>
              <a href="https://github.com/gatsbyjs/gatsby/tree/1.0/examples/using-sass">
                Code for site on Github
              </a>
            </li>
          </ul>
        </div>
      </div>
    )
  }
}

export default Index

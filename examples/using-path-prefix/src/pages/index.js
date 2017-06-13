import React from "react"
import Link from "gatsby-link"

const Home = () =>
  <div>
    <h1>Using prefixed paths</h1>
    <ul>
      <li>
        <Link to="/a/">A</Link>
      </li>
      <li>
        <Link to="/b/">B</Link>
      </li>
      <li>
        <Link to="/c/">C</Link>
      </li>
    </ul>
  </div>

export default Home

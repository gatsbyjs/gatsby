import React from "react"
import { Link } from "gatsby"

const OtherPage = () => (
  <div
    css={{
      display: `flex`,
      alignItems: `center`,
      justifyContent: `center`,
      flexDirection: `column`,
      height: `100vh`,
    }}
  >
    <h1>Weeee...</h1>
    <img src="https://media1.giphy.com/media/urVO9yrQhKwDK/200.webp#1-grid1" alt="Man dancing on a bucking bronco. Wheeee!" />
    <Link to="/">Back home</Link>
  </div>
)

export default OtherPage

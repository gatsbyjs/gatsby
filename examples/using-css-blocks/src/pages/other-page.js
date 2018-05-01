import React from "react"
import { Link } from "gatsby"
import styles from "other-page.block.css"

const OtherPage = () => (
  <div className={styles}>
    <h1>Weeee...</h1>
    <img src="https://media1.giphy.com/media/urVO9yrQhKwDK/200.webp#1-grid1" />
    <Link to="/">Back home</Link>
  </div>
)

export default OtherPage

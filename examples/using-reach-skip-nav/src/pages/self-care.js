import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const SelfCare = () => (
  <Layout>
    <SEO title="Self care" />
    <h1>If you activate the skip link, the next tab will take you to the "Go back to homepage" link.</h1>
    <p>
      Feeling stressed today? Here are some things you can do to help you feel
      better:
    </p>
    <ul>
      <li>Light a candle</li>
      <li>Take deep breaths (I like to imagine I'm blowing bubbles)</li>
      <li>Find something soft to play with</li>
      <li>Put some music on and dance it out</li>
      <li>Drink some tea</li>
      <li>Tidy your desk</li>
      <li>Draw something</li>
      <li>Go for a walk</li>
      <li>Do some yoga</li>
    </ul>
    <Link to="/">Go back to the homepage</Link>
  </Layout>
)

export default SelfCare

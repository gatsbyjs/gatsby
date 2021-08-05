import React from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"

import ChameleonLandscape from "../img/landscape.jpg"
import ChameleonPortrait from "../img/portrait.jpg"

export default function Home() {
  return (
    <div>
      <h1>Testing images</h1>
      These landscape and portrait images are used in addition to pngs of
      varying dimensions. The chameleon images make it easier to see where
      images are getting cropped.
      <div style={{ display: `flex`, flexDirection: `row` }}>
        <Img fixed={data.file.childImageSharp.fixed} alt="headshot"/>
        <img alt="Chameleon" height={200} src={ChameleonLandscape} />
        <img alt="Chameleon" height={200} src={ChameleonPortrait} />
      </div>
      <hr />
      <div>
        <Link to="/gatsby-images">Gatsby Images</Link>
      </div>
      <div>
        <Link to="/static-images">Static Images</Link>
      </div>
    </div>
  )
}
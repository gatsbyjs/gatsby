import { babelRecast } from "../codemod"

const CODE = `
import React from "react"
import { graphl } from "gatsby"
import Img from "gatsby-image"

<Img 
fixed={data.file.childImageSharp.fixed}
alt="headshot"/>
`

const MATT = `
export const Hero: React.SFC = ({ children }) => {
  return (
      <Img
          fluid={data.file.childImageSharp.fluid}
          alt="A panorama of Skara Brae, Orkney"
          style={{
              width: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: -1
          }}
      />
  );
};`

describe(`recast`, () => {
  it(`preserves formatting`, () => {
    const received = babelRecast(CODE, `test.js`)

    expect(received).toBe(
      `
import React from "react"
import { graphl } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image";

<GatsbyImage image={data.file.childImageSharp.gatsbyImageData} alt="headshot" />
`
    )
  })

  it(`supports typescript`, () => {
    const received = babelRecast(MATT, `test.ts`)
    expect(received).toBe(`
export const Hero: React.SFC = ({ children }) => {
  return (
      <GatsbyImage
          image={data.file.childImageSharp.gatsbyImageData}
          alt="A panorama of Skara Brae, Orkney"
          style={{
              width: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: -1
          }} />
  );
};`)
  })
})

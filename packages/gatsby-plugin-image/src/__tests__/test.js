import { babelRecast } from "../codemod"

const CODE = `
import React from "react"
import { graphl } from "gatsby"
import Img from "gatsby-image"

<Img 
fixed={data.file.childImageSharp.fixed}
alt="headshot"/>
`

describe(`recast`, () => {
  it(`preserves formatting`, () => {
    const received = babelRecast(CODE)

    expect(received).toBe(
      `
import React from "react"
import { graphl } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image";

<GatsbyImage image={data.file.childImageSharp.gatsbyImageData} alt="headshot" />
`
    )
  })
})

import React from "react"
import { useStaticQuery } from "gatsby"
import Image from "gatsby-image"

// TODO: move into core-utils or somewhere else shared
import { hashFromProps, splitProps } from "gatsby/dist/query/static-image"

export function StaticImage(props) {
  const hash = hashFromProps(props)
  const { staticImage } = useStaticQuery(hash)
  const { gatsbyImageProps } = splitProps(props)

  return <Image {...gatsbyImageProps} {...staticImage.childImageSharp} />
}

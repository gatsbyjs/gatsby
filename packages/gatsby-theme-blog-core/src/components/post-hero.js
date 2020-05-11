import React from "react"
import Image from "gatsby-image"

const Hero = ({ post }) => (
  <>
    {post?.image?.childImageSharp && (
      <Image
        fluid={post.image.childImageSharp.fluid}
        alt={post.imageAlt ? post.imageAlt : post.excerpt}
        className="post-hero"
      />
    )}
  </>
)

export default Hero

import React from "react"
import { graphql } from "gatsby"
import styled from "@emotion/styled"
import { css } from "@emotion/core"
import { FaGithub } from "react-icons/fa"

import Layout from "../components/layout"
import { colors } from "../utils/presets"

const FeatureList = styled(`ul`)`
  margin-left: 0;
  list-style: none;
`

const FeatureListItem = styled.li({
  backgroundImage: `url(
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='${colors.gatsby}' d='M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z' /%3E%3C/svg%3E")`,
  backgroundPosition: `0 .25em`,
  backgroundRepeat: `no-repeat`,
  backgroundSize: `1em`,
  paddingLeft: `1.5em`,
})

const Index = ({ data, location }) => (
  <Layout
    location={location}
    image={data.coverImage.childImageSharp.fluid}
    imageTitle={`“Black and silver vintage camera” by Alexander Andrews (via unsplash.com)`}
    imageBackgroundColor={colors.ui.whisper}
  >
    <p>
      <a href="https://www.gatsbyjs.com/plugins/gatsby-image/">gatsby-image</a>
      {` `}
      is the official Image component for use in building Gatsby websites. It
      provides the fastest, most optimized image loading performance possible
      for Gatsby (and other React) websites.
    </p>
    <p>
      The component requires
      {` `}
      <em
        css={css`
          font-style: normal;
          font-weight: bold;
        `}
      >
        no configuration
      </em>
      {` `}
      when used within Gatsby. All image processing is done within Gatsby and
      official plugins.
    </p>
    <p>
      See the
      {` `}
      <a href="https://www.gatsbyjs.com/plugins/gatsby-image/">
        component’s documentation
      </a>
      {` `}
      as well as
      {` `}
      <a href="https://github.com/gatsbyjs/gatsby/blob/master/examples/using-gatsby-image/">
        <FaGithub
          css={css`
            position: relative;
            bottom: -0.125em;
            background-image: none;
          `}
        />
        {` `}
        view this site’s source
      </a>
      {` `}
      to learn how to start using gatsby-image on your Gatsby sites.
    </p>
    <h2>Out of the box it:</h2>
    <FeatureList>
      <FeatureListItem>
        Loads the optimal size of image for each device size and screen
        resolution
      </FeatureListItem>
      <FeatureListItem>
        Holds the image position while loading so your page doesn’t jump around
        as images load
      </FeatureListItem>
      <FeatureListItem>
        Uses the “blur-up” effect i.e. it loads a tiny version of the image to
        show while the full image is loading
      </FeatureListItem>
      <FeatureListItem>
        Alternatively provides a “traced placeholder” SVG of the image.
      </FeatureListItem>
      <FeatureListItem>
        Lazy loads images which reduces bandwidth and speeds the initial load
        time
      </FeatureListItem>
      <FeatureListItem>
        Uses WebP images if browser supports the format
      </FeatureListItem>
    </FeatureList>
  </Layout>
)

export default Index

export const query = graphql`
  query {
    coverImage: file(
      relativePath: { regex: "/alexander-andrews-260988-unsplash-edited/" }
    ) {
      childImageSharp {
        fluid(
          maxWidth: 800
          quality: 80
          duotone: { highlight: "#ffffff", shadow: "#663399" }
        ) {
          ...GatsbyImageSharpFluid
        }
      }
    }
  }
`

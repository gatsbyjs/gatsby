import { graphql } from "gatsby"
import React from "react"

import Img from "../components/core/img"

const Profiles = ({ profiles }) => (
  <>
    {profiles.map((profile, i) => (
        <div>
          {profile.hoverPhoto && (
            <Img
              css={{
                display: `none !important`,
                position: `absolute !important`,
                borderRadius: radii[6],
                marginBottom: space[5],
                transform: `translateZ(0)`,
                [breakpoint]: {
                  marginBottom: 0,
                  display: `block !important`,
                },
              }}
              fixed={profile.hoverPhoto.fixed}
            />
          )}
          {profile.photo && (
            <Img
              css={{
                borderRadius: radii[6],
                marginBottom: space[5],
                transform: `translateZ(0)`,
                [breakpoint]: {
                  marginBottom: 0,
                  ...(profile.hoverPhoto
                    ? {
                        ":hover": {
                          opacity: `0 !important`,
                        },
                      }
                    : {}),
                },
              }}
              fixed={profile.photo.fixed}
            />
          )}
        </div>
    ))}
  </>
)

export const query = graphql`
  fragment ProfilesFragment on ContentfulProfile {
    name
    title
    photo {
      fixed(width: 80, height: 80, quality: 90) {
        ...GatsbyContentfulFixed
      }
    }
    hoverPhoto {
      fixed(width: 80, height: 80, quality: 90) {
        ...GatsbyContentfulFixed
      }
    }
    twitter
    gitHub
    website
    bio {
      childMarkdownRemark {
        html
      }
    }
  }
`

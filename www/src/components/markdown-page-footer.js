import React from "react"
import { graphql } from "gatsby"
import EditIcon from "react-icons/lib/md/create"

import { rhythm, scale } from "../utils/typography"
import { colors } from "../utils/presets"

export default class MarkdownPageFooter extends React.Component {
  constructor() {
    super()
    this.state = { feedbackSubmitted: false }
  }
  render() {
    return (
      <>
        <hr css={{ marginTop: rhythm(2) }} />

        {this.props.page && (
          <a
            css={{
              "&&": {
                display: `block`,
                color: colors.gray.calm,
                fontSize: scale(-1 / 5).fontSize,
                fontWeight: `normal`,
                border: `none`,
                boxShadow: `none`,
                padding: rhythm(1 / 2),
                "&:hover": {
                  background: `transparent`,
                  color: colors.gatsby,
                },
              },
            }}
            href={`https://github.com/gatsbyjs/gatsby/blob/master/${
              this.props.packagePage ? `packages` : `docs`
            }/${this.props.page ? this.props.page.parent.relativePath : ``}`}
          >
            <EditIcon css={{ fontSize: 20, position: `relative`, top: -2 }} />
            {` `}
            edit this page on GitHub
          </a>
        )}
      </>
    )
  }
}

export const fragment = graphql`
  fragment MarkdownPageFooter on MarkdownRemark {
    parent {
      ... on File {
        relativePath
      }
    }
  }
`

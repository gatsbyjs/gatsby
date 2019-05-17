import React from "react"
import { graphql } from "gatsby"
import EditIcon from "react-icons/lib/md/create"

import { space } from "../utils/presets"
import { linkStyles } from "../utils/styles"

export default class MarkdownPageFooter extends React.Component {
  constructor() {
    super()
    this.state = { feedbackSubmitted: false }
  }
  render() {
    return (
      <>
        <hr css={{ marginTop: space[9] }} />

        {this.props.page && (
          <a
            css={{ ...linkStyles }}
            href={`https://github.com/gatsbyjs/gatsby/blob/master/${
              this.props.packagePage ? `packages` : `docs`
            }/${this.props.page ? this.props.page.parent.relativePath : ``}`}
          >
            <EditIcon css={{ marginRight: space[2] }} />
            {` `}
            Edit this page on GitHub
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

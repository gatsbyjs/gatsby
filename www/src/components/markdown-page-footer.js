import React from "react"
import gray from "gray-percentage"
import EditIcon from "react-icons/lib/md/create"
import CheckIcon from "react-icons/lib/md/thumb-up"
import CrossIcon from "react-icons/lib/md/thumb-down"
import { GraphQLClient } from "graphql-request"

import { rhythm, scale } from "../utils/typography"

const client = new GraphQLClient(
  `https://api.graph.cool/relay/v1/cj8xuo77f0a3a0164y7jketkr`
)

function sendReview(thumbsUp, relativePath) {
  return client.request(`
    mutation {
      createReview(input: {thumbsUp: ${thumbsUp}, relativePath: "${
    relativePath
  }", clientMutationId: "1"}) {
        review {
          id
        }
      }
    }
  `)
}

export default class MarkdownPageFooter extends React.Component {
  constructor() {
    super()
    this.state = { feedbackSubmitted: false }
  }
  render() {
    return [
      <hr css={{ marginTop: rhythm(2) }} />,
      <div
        css={{
          marginBottom: rhythm(1),
        }}
      >
        {this.state.feedbackSubmitted ? (
          <span css={{ lineHeight: rhythm(2) }}>Thank you!</span>
        ) : (
          <span css={{ lineHeight: rhythm(2) }}>
            Was this helpful?{` `}
            <CheckIcon
              onClick={() => {
                sendReview(true, this.props.page.parent.relativePath)
                this.setState({ feedbackSubmitted: true })
              }}
              css={{
                color: `#37b635`,
                fontSize: rhythm(1.3),
                padding: rhythm(0.2),
                position: `relative`,
                top: -3,
                marginLeft: rhythm(1 / 4),
                cursor: `pointer`,
              }}
            />
            {` `}
            <CrossIcon
              onClick={() => {
                sendReview(false, this.props.page.parent.relativePath)
                this.setState({ feedbackSubmitted: true })
              }}
              css={{
                color: `#ec1818`,
                fontSize: rhythm(1.3),
                padding: rhythm(0.2),
                cursor: `pointer`,
              }}
            />
          </span>
        )}
        <a
          css={{
            "&&": {
              float: `right`,
              display: `block`,
              color: gray(60, 270),
              fontSize: scale(-1 / 5).fontSize,
              border: `none`,
              boxShadow: `none`,
              padding: rhythm(1 / 2),
              "&:hover": {
                background: gray(90),
              },
            },
          }}
          href={`https://github.com/gatsbyjs/gatsby/blob/master/docs/${
            this.props.page.parent.relativePath
          }`}
        >
          <EditIcon css={{ fontSize: 20, position: `relative`, top: -2 }} />
          {` `}
          edit this page on Github
        </a>
      </div>,
    ]
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

import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import StoryItem from "../components/story-item"

class Index extends React.Component {
  render() {
    const { allHnStory } = this.props.data
    return (
      <Layout>
        <table border="0" className="itemlist" cellPadding={0} cellSpacing={0}>
          <tbody>
            {allHnStory.edges.map(({ node }) => (
              <StoryItem key={node.id} story={node} />
            ))}
            <tr className="morespace" style={{ height: `10px` }} />
            <tr>
              <td style={{ paddingLeft: 36 }} className="title">
                <a href="/page/2/" className="morelink" rel="nofollow">
                  More
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </Layout>
    )
  }
}

export default Index

export const pageQuery = graphql`
  {
    allHnStory(sort: { order: ASC }) {
      edges {
        node {
          ...Story_item
        }
      }
    }
  }
`

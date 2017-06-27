import React from "react"

import StoryItem from "../components/story-item"

class Index extends React.Component {
  render() {
    const { allHnStory } = this.props.data

    console.log(this.props)
    return (
      <table border="0" className="itemlist" cellPadding={0} cellSpacing={0}>
        {allHnStory.edges.map(({ node }) => <StoryItem story={node} />)}
        <tr className="morespace" style={{ height: `10px` }} />
        <tr>
          <td style={{ paddingLeft: 36 }} className="title">
            <a href="/page/2/" className="morelink" rel="nofollow">
              More
            </a>
          </td>
        </tr>
      </table>
    )
  }
}

export default Index

export const pageQuery = graphql`
  query PageQuery {
    allHnStory(sort: { fields: [order] }) {
      edges {
        node {
          ...Story_item
        }
      }
    }
  }
`

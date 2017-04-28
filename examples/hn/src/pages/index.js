import React from "react"

import StoryItem from "../components/story-item"

class Index extends React.Component {
  render() {
    console.log(this.props)
    return (
      <table border="0" className="itemlist" cellPadding={0} cellSpacing={0}>
        {this.props.data.allHnStory.edges.map(edge => {
          return <StoryItem story={edge.node} />
        })}
        <tr className="morespace" style={{ height: "10px" }} />
        <tr>
          <td style={{ paddingLeft: 36 }} className="title">
            <a href="/page/2/" className="morelink" rel="nofollow">More</a>
          </td>
        </tr>
      </table>
    )
  }
}

export default Index

export const pageQuery = `
{
  allHnStory(sortBy: {fields: [order]}) {
    edges {
      node {
        id
        title
        score
        order
        domain
        url
        by
        descendants
        timeISO(fromNow: true)
      }
    }
  }
}
`

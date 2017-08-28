import React from "react"

import sGif from "../images/s.gif"

class StoryComment extends React.Component {
  render() {
    const comment = this.props.comment
    // console.log(comment)
    return (
      <table border="0">
        <tr>
          <td className="ind">
            <img
              src={sGif}
              height="1"
              width={comment.depth * Math.min(40, this.props.width / 20) + 14}
            />
          </td>
          <td className="default">
            <div style={{ marginTop: 2, marginBottom: -10 }}>
              <span className="comhead">
                <strong>{comment.by}</strong>
                {` `}
                <span className="age">{comment.timeISO}</span>
              </span>
            </div>
            <br />
            <div className="comment">
              <span
                className="c00"
                dangerouslySetInnerHTML={{
                  __html: comment.text,
                }}
              />
            </div>
            <div className="reply">
              <p>
                <font size="1">
                  <u>
                    <a href="#noop">reply</a>
                  </u>
                </font>
              </p>
            </div>
          </td>
        </tr>
      </table>
    )
  }
}

export default StoryComment

export const commentFragment = graphql`
  fragment StoryComment on HNComment {
    id
    text
    timeISO(fromNow: true)
    by
  }
`

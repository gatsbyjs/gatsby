import React from "react"
import Link from "gatsby-link"

import "../css/news.css"
import y18Gif from "../images/y18.gif"
import sGif from "../images/s.gif"

class DefaultLayout extends React.Component {
  render() {
    return (
      <center>
        <table
          id="hnmain"
          border={0}
          cellPadding={0}
          cellSpacing={0}
          style={{
            borderWidth: 0,
            backgroundColor: `#f6f6ef`,
          }}
        >
          <tr>
            <td style={{ backgroundColor: `#ff6600` }}>
              <table
                border={`0`}
                cellPadding={`0`}
                cellSpacing={0}
                style={{
                  borderWidth: 0,
                  borderSpacing: 0,
                  width: `100%`,
                  padding: `2px`,
                  paddingBottom: 0,
                  marginBottom: -1, // Not sure where extra bottom padding is coming from.
                }}
              >
                <tr>
                  <td style={{ width: `18px`, paddingRight: `4px` }}>
                    <a href="http://www.ycombinator.com">
                      <img
                        src={y18Gif}
                        width="18px"
                        height="18px"
                        style={{ border: `1px white solid` }}
                      />
                    </a>
                  </td>
                  <td style={{ lineHeight: `12pt`, height: `10px` }}>
                    <span className="pagetop">
                      <b className="hnname">
                        <Link to="/">Hacker News </Link>
                      </b>
                      <a href="newest">new</a>
                      {` `}
                      |
                      {` `}
                      <a href="newcomments">comments</a>
                      {` `}
                      |
                      {` `}
                      <a href="show">show</a>
                      {` `}
                      |
                      {` `}
                      <a href="ask">ask</a>
                      {` `}
                      |
                      {` `}
                      <a href="jobs">jobs</a>
                      {` `}
                      |
                      {` `}
                      <a href="submit">submit</a>
                      {` `}
                    </span>
                  </td>
                  <td style={{ textAlign: `right`, paddingRight: `4px` }}>
                    <span className="pagetop">
                      <a href="login?goto=news">login</a>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr style={{ height: `10px` }} />
          <tr>
            <td>{this.props.children()}</td>
          </tr>
          <tr>
            <td>
              <img src={sGif} height="10" width="0" />
              <table width="100%" cellSpacing="0" cellPadding="1">
                <tr>
                  <td style={{ backgroundColor: `#ff6600` }} />
                </tr>
              </table>
              <br />
              <center>
                <span className="yclinks">
                  <a href="newsguidelines.html">Guidelines</a>
                  | <a href="newsfaq.html">FAQ</a>
                  | <a href="mailto:hn@ycombinator.com">Support</a>
                  | <a href="https://github.com/HackerNews/API">API</a>
                  | <a href="security.html">Security</a>
                  | <a href="lists">Lists</a>
                  | <a href="bookmarklet.html">Bookmarklet</a>
                  | <a href="dmca.html">DMCA</a>
                  | <a href="http://www.ycombinator.com/apply/">Apply to YC</a>
                  | <a href="mailto:hn@ycombinator.com">Contact</a>
                </span>
              </center>
            </td>
          </tr>
        </table>
      </center>
    )
  }
}

export default DefaultLayout

import React from "react"
import Helmet from "react-helmet"
import distanceInWords from 'date-fns/distance_in_words'
import typography, { rhythm } from "../utils/typography"

import MarkdownPageFooter from "../components/markdown-page-footer"

import Container from "../components/container"

class RemotePackagesTemplate extends React.Component {
  render(){
    const deprecated = this.props.data.npmPackage.deprecated === "false" ? false : true
    const page = this.props.data.npmPackage.readme.childMarkdownRemark
    const info = this.props.data.npmPackage
    const lastUpdated = `${distanceInWords(new Date(info.modified), new Date())} ago`;
    return(
      <Container>
        <Helmet>

        </Helmet>
        <div className="deprecatedHeader"
          css={{
            display: deprecated ? `block` : `none`,
          }}
          >
          <h1>{info.name}</h1>
          <p>{info.deprecated}</p>
        </div>

        <div className="metadataHeader">
          <a href={info.repository ? info.repository.url : "" }>Browse source code for this package on Github</a>

          <div css={{
            fontSize: rhythm(.5),
            color: `#D3D3D3`,
          }}>
            {info.keywords.join(", ")}
          </div>

          <div
            css={{
              display: `flex`,
              paddingTop: rhythm(.25),
            }}
            >
            <img
              width="20"
              height="20"
              src={info.lastPublisher.avatar}
             />
              <span css={{paddingLeft: rhythm(.25), fontSize: rhythm(.5), textTransform: `uppercase`}}>{info.lastPublisher.name}</span>
              <span css={{paddingLeft: rhythm(.25), fontSize: rhythm(.5)}}>{lastUpdated}</span>
          </div>


        </div>

        <div
          css={{
            display: deprecated ? `none` : `block`,
          }}
          dangerouslySetInnerHTML={{
            __html: page.html
          }}
        />
        {/* <MarkdownPageFooter page={page} /> */}
      </Container>
    )
  }
}

export default RemotePackagesTemplate;

export const npmQuery = graphql`
  query TemplateRemoteMarkdown($id: String!) {
    npmPackage(id: {eq: $id}){
      name
      description
      deprecated
      keywords
      lastPublisher{
        name
        avatar
      }
      modified
      repository{
        url
        project
        user
      }
      humanDownloadsLast30Days
      readme{
        childMarkdownRemark{
          html
        }
      }
    }
  }
`

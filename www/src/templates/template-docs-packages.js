import React from "react"
import Helmet from "react-helmet"
import distanceInWords from 'date-fns/distance_in_words'

import MarkdownPageFooter from "../components/markdown-page-footer"
import { rhythm, scale } from "../utils/typography"
import presets from "../utils/presets"
import Container from "../components/container"

class DocsPackagesTemplate extends React.Component {
  render() {
    const packageName = this.props.data.markdownRemark.fields.title
    const page = this.props.data.markdownRemark
    const metaData = this.props.data.npmPackage
    const lastUpdated = `${distanceInWords(new Date(metaData.modified), new Date())} ago`;


    console.log(this.props);
    return (
      <Container>
        <Helmet>
          <title>{page.fields.title}</title>
          <meta name="description" content={page.excerpt} />
          <meta name="og:description" content={page.excerpt} />
          <meta name="twitter:description" content={page.excerpt} />
          <meta name="og:title" content={page.fields.title} />
          <meta name="og:type" content="article" />
          <meta name="twitter.label1" content="Reading time" />
          <meta name="twitter:data1" content={`${page.timeToRead} min read`} />
        </Helmet>
        <strong>
          <a
            href={`https://github.com/gatsbyjs/gatsby/tree/master/packages/${packageName}`}
          >
            Browse source code for this package on GitHub
          </a>
        </strong>

        <div className="metadataHeader">

          <div css={{
            fontSize: rhythm(.5),
            color: `#D3D3D3`,
          }}>
            {metaData.keywords.join(", ")}
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
              src={metaData.lastPublisher.avatar}
             />
              <span css={{paddingLeft: rhythm(.25), fontSize: rhythm(.5), textTransform: `uppercase`}}>{metaData.lastPublisher.name}</span>
              <span css={{paddingLeft: rhythm(.25), fontSize: rhythm(.5)}}>{lastUpdated}</span>
          </div>


        </div>

        <div
          css={{
            position: `relative`,
          }}
          dangerouslySetInnerHTML={{
            __html: this.props.data.markdownRemark.html,
          }}
        />
        <MarkdownPageFooter page={page} />
      </Container>
    )
  }
}

export default DocsPackagesTemplate

export const pageQuery = graphql`
  query TemplateDocsPackages($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      excerpt
      timeToRead
      fields {
        title
      }
      ...MarkdownPageFooter
    }
    npmPackage(slug: {eq: $slug}){
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

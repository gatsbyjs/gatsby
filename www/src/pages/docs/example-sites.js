import React from "react"
import { rhythm } from "../../utils/typography"
import Container from "../../components/container"

class ExampleSitesDocs extends React.Component {
  render() {
    console.log(this.props);
    return (
      <Container>
        <h1 css={{ marginTop: 0 }}>Example Sites</h1>
        <div css={{}}>
          {this.props.data.allExampleSitesYaml.edges.map(({ node }, i) =>
            <div key={node.id} css={{ marginBottom: rhythm(1.5) }}>
              <h2>{node.title}</h2>
              <a href={node.url} css={{ borderBottom: 0, boxShadow: 'none' }}>
                <img
                  css={{ marginBottom: rhythm(1 / 2) }}
                  src={node.thumbnail.childImageSharp.responsiveResolution.src}
                  srcSet={node.thumbnail.childImageSharp.responsiveResolution.srcSet}
                  sizes={node.thumbnail.childImageSharp.responsiveResolution.sizes}
                />
              </a>
              <p>{node.description}</p>
            </div>
          )}
        </div>
      </Container>
    )
  }
}

export default ExampleSitesDocs

export const pageQuery = graphql`
  query ExampleSitesQuery {
  allExampleSitesYaml {
    edges {
      node {
        id
        title
        url
        description
        thumbnail {
          id
          childImageSharp {
            id
            responsiveResolution(width:655) {
              base64
              aspectRatio
              width
              height
              src
              srcSet
            }
          }
        }
      }
    }
  }
  }
`

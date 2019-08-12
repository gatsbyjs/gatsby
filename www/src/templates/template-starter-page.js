import React from "react"
import { Helmet } from "react-helmet"
import { graphql } from "gatsby"

import Layout from "../components/layout"

import { mediaQueries } from "../utils/presets"
import StarterHeader from "../views/starter/header"
import StarterMeta from "../views/starter/meta"
import StarterScreenshot from "../views/starter/screenshot"
import StarterSource from "../views/starter/source"
import StarterDetails from "../views/starter/details"
import FooterLinks from "../components/shared/footer-links"

const getScreenshot = (data, fallback) => {
  if (!data.screenshotFile || !data.screenshotFile.childImageSharp) {
    return fallback
  }
  return data.screenshotFile
}

class StarterTemplate extends React.Component {
  state = {
    showAllDeps: false,
  }
  render() {
    const { fallback, startersYaml } = this.props.data
    const {
      url: demoUrl,
      repo: repoUrl,
      fields: { starterShowcase },
      childScreenshot,
    } = startersYaml

    const screenshot = getScreenshot(childScreenshot, fallback)

    // preprocessing of dependencies
    const { miscDependencies = [], gatsbyDependencies = [] } = starterShowcase
    const allDeps = [
      ...gatsbyDependencies.map(([name]) => name),
      ...miscDependencies.map(([name]) => name),
    ]
    const shownDeps = this.state.showAllDeps ? allDeps : allDeps.slice(0, 15)
    const showMore =
      !this.state.showAllDeps && allDeps.length - shownDeps.length > 0

    // plug for now
    const isModal = false
    const repoName = starterShowcase.name
    return (
      <Layout
        location={this.props.location}
        isModal={isModal}
        modalBackgroundPath="/showcase"
      >
        <div
          css={{
            alignItems: `center`,
            display: `flex`,
            flexDirection: `column`,
            maxWidth: isModal ? false : 1080,
            margin: isModal ? false : `0 auto`,
          }}
        >
          <div
            css={{
              width: `100%`,
            }}
          >
            <Helmet>
              <title>{`${repoName}: Gatsby Starter`}</title>
              <meta
                property="og:image"
                content={screenshot.childImageSharp.fluid.src}
              />
              <meta property="og:image:alt" content="Gatsby Logo" />
              <meta
                name="twitter:image"
                content={screenshot.childImageSharp.fluid.src}
              />
              <meta
                name="description"
                content={`Gatsby Starter: ${repoName}`}
              />
              <meta
                property="og:description"
                content={`Gatsby Starter: ${repoName}`}
              />
              <meta
                name="twitter:description"
                content={`Gatsby Starter: ${repoName}`}
              />
              <meta property="og:site_name" content={repoName} />
              <meta property="og:title" content={repoName} />
              <meta property="og:type" content="article" />
              <meta name="twitter.label1" content="Reading time" />
              <meta name="twitter:data1" content={`1 min read`} />
            </Helmet>
            <StarterHeader stub={starterShowcase.stub} />
            <div
              css={{
                display: `flex`,
                flexDirection: `column-reverse`,
                [mediaQueries.sm]: {
                  flexDirection: `column`,
                },
              }}
            >
              <StarterMeta
                starter={starterShowcase}
                repoName={repoName}
                imageSharp={screenshot}
                demo={demoUrl}
              />
              <StarterScreenshot imageSharp={screenshot} repoName={repoName} />
            </div>
            <StarterSource repoUrl={repoUrl} startersYaml={startersYaml} />
            <StarterDetails
              startersYaml={startersYaml}
              allDeps={allDeps}
              shownDeps={shownDeps}
              showMore={showMore}
              showAllDeps={this.showAllDeps}
            />
            <FooterLinks />
          </div>
        </div>
      </Layout>
    )
  }

  showAllDeps = () => {
    this.setState({ showAllDeps: true })
  }
}

export default StarterTemplate

export const pageQuery = graphql`
  fragment ScreenshotDetails on ImageSharp {
    fluid(maxWidth: 700) {
      ...GatsbyImageSharpFluid
    }
    resize(width: 1500, height: 1500, cropFocus: CENTER, toFormat: JPG) {
      src
    }
  }

  query TemplateStarter($slug: String!) {
    startersYaml(fields: { starterShowcase: { slug: { eq: $slug } } }) {
      id
      fields {
        starterShowcase {
          slug
          stub
          description
          stars
          lastUpdated
          owner
          name
          githubFullName
          allDependencies
          gatsbyDependencies
          miscDependencies
        }
      }
      url
      repo
      description
      tags
      features
      internal {
        type
      }
      childScreenshot {
        screenshotFile {
          childImageSharp {
            ...ScreenshotDetails
          }
        }
      }
    }

    fallback: file(relativePath: { eq: "screenshot-fallback.png" }) {
      childImageSharp {
        ...ScreenshotDetails
      }
    }
  }
`

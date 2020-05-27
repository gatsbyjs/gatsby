/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { graphql } from "gatsby"

import PageMetadata from "../components/page-metadata"
import StarterHeader from "../views/starter/header"
import StarterMeta from "../views/starter/meta"
import Screenshot from "../views/shared/screenshot"
import StarterSource from "../views/starter/source"
import StarterInstallation from "../views/starter/installation"
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

    // TODO enable modal view
    const repoName = starterShowcase.name
    return (
      <div
        css={{
          alignItems: `center`,
          display: `flex`,
          flexDirection: `column`,
          margin: `0 auto`,
          maxWidth: 1080,
        }}
      >
        <PageMetadata
          title={`${repoName}: Gatsby Starter`}
          description={`Gatsby Starters: ${repoName}`}
          image={screenshot.childImageSharp.fluid}
        />
        <div css={{ width: `100%` }}>
          <StarterHeader stub={starterShowcase.stub} />
          <div
            sx={{
              display: `flex`,
              flexDirection: [`column-reverse`, `column`],
            }}
          >
            <StarterMeta
              starter={starterShowcase}
              repoName={repoName}
              imageSharp={screenshot}
              demo={demoUrl}
            />
            <Screenshot
              imageSharp={screenshot.childImageSharp.fluid}
              alt={`Screenshot of ${repoName}`}
            />
          </div>
          <StarterSource
            repoUrl={repoUrl}
            startersYaml={startersYaml}
            starter={starterShowcase}
          />
          <StarterInstallation repoName={repoName} repoUrl={repoUrl} />
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

import React from "react"
import Link from "gatsby-link"
import { rhythm, scale, options } from "../utils/typography"
import Container from "../components/container"
import presets from "../utils/presets"
import colors from "../utils/colors"

const mobileBackgroundImage = {
  backgroundImage: `
            linear-gradient(45deg, #f5f3f7 60%, white 60%)`,
}
const desktopBackgroundImage = {
  backgroundImage: `
            linear-gradient(-45deg, #744c9e 37.5%, transparent 37.5%),
            linear-gradient(-45deg, #9d7cbf 50%, transparent 50%),
            linear-gradient(45deg, #f5f3f7 33%, white 33%)`,
}
const headerHeight = `55px`
const IndexRoute = React.createClass({
  render() {
    console.log(this.props.data)
    return (
      <div>
        <div
          css={{
            background: presets.purple,
            ...mobileBackgroundImage,
            // backgroundImage: `url("http://www.transparenttextures.com/patterns/argyle.png")`,
            // backgroundImage: `linear-gradient(135deg,${colors.b[14]},${colors
            // .b[13]},${colors.b[12]})`,
            paddingBottom: rhythm(1),
            [presets.Desktop]: {
              paddingTop: headerHeight,
              height: rhythm(20),
              ...desktopBackgroundImage,
            },
          }}
        >
          <div
            css={{
              padding: rhythm(1),
              paddingLeft: rhythm(1.5),
              [presets.Desktop]: {
                width: rhythm(23),
              },
              [presets.Hd]: {
                padding: rhythm(1),
                paddingLeft: rhythm(1.5),
                width: rhythm(27),
              },
            }}
          >
            <h1
              css={{
                marginTop: rhythm(1),
                marginBottom: rhythm(1.5),
                color: `#744c9e`,
                ...scale(1),
                lineHeight: 1,
                [presets.Tablet]: {
                  lineHeight: 0.9,
                },
                lineHeight: 1,
                [presets.Desktop]: {
                  fontSize: scale(1.5).fontSize,
                },
                [presets.Hd]: {
                  marginTop: rhythm(1),
                  marginBottom: rhythm(1.5),
                  fontSize: scale(1.75).fontSize,
                },
              }}
            >
              Blazing-fast static site generator for React
            </h1>
            <div>
              <Link
                css={{
                  ...scale(2 / 5),
                  display: `inline-block`,
                  fontFamily: options.headerFontFamily.join(`,`),
                  padding: `${rhythm(1 / 2)} ${rhythm(1)}`,
                  // Increase specificity
                  "&&": {
                    border: `1px solid #744c9e`,
                    boxShadow: `none`,
                    color: `#744c9e`,
                    ":hover": { background: `#744c9e`, color: `white` },
                  },
                }}
                to="/docs/"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
        <Container hasSideBar={false}>
          <div css={{ display: `flex`, flexWrap: `wrap` }}>
            <div
              css={{
                flex: `0 0 100%`,
                [presets.Tablet]: { flex: 1, paddingRight: rhythm(2) },
              }}
            >
              <h2>Modern web tech without the headache</h2>
              <p>
                Enjoy all the power of the latest web technologies. React.js,
                webpack, modern JavaScript and CSS and more are all setup and
                waiting for you to install and start building.
              </p>
            </div>
            <div
              css={{
                flex: `0 0 100%`,
                [presets.Tablet]: { flex: 1, paddingRight: rhythm(2) },
              }}
            >
              <h2>Bring your own data</h2>
              <p>
                Gatsby’s rich data plugin ecosystem lets you build sites with
                the data you want. Integrate data from one or many sources:
                headless CMSs, SaaS services, APIs, databases, your file system,
                and more. Pull data directly into your pages using GraphQL.
              </p>
            </div>
          </div>
          <div css={{ display: `flex`, flexWrap: `wrap` }}>
            <div
              css={{
                flex: `0 0 100%`,
                [presets.Tablet]: { flex: 1, paddingRight: rhythm(2) },
              }}
            >
              <h2>Scale to the entire internet</h2>
              <p>
                Gatsby.js is Internet Scale. Forget complicated deploys with
                databases and servers and their expensive, time-consuming setup
                costs, maintenance, and scaling fears. Gatsby.js builds your
                site as “static” files which can be deployed easily on dozens of
                services.
              </p>
            </div>
            <div
              css={{
                flex: `0 0 100%`,
                [presets.Tablet]: { flex: 1, paddingRight: rhythm(2) },
              }}
            >
              <h2>Future-proof your website</h2>
              <p>
                Don't build a website with last decade's tech. The future of the
                web is mobile, JavaScript and APIs—the {` `}
                <a href="https://jamstack.org/">JAMstack</a>. Every website is a
                web app and every web app is a website. Gatsby.js is the
                universal JavaScript framework you’ve been waiting for.
              </p>
            </div>
          </div>
          <div css={{ display: `flex`, flexWrap: `wrap` }}>
            <div
              css={{
                flex: `0 0 100%`,
                [presets.Tablet]: { flex: 1, paddingRight: rhythm(2) },
              }}
            >
              <h2>
                <em>Static</em> Progessive Web Apps
              </h2>
              <p>
                Gatsby.js is a static PWA (Progressive Web App) generator. You
                get code and data splitting out-of-the-box. Gatsby loads an HTML
                file that’s a server rendered version of your React.js page then
                makes it live with JavaScript. Code and data for other pages get
                preloaded so clicking around the site feels incredibly fast.
              </p>
            </div>
            <div
              css={{
                flex: `0 0 100%`,
                [presets.Tablet]: { flex: 1, paddingRight: rhythm(2) },
              }}
            >
              <h2>Speed past the competition</h2>
              <p>
                Gatsby.js builds the fastest possible website. Instead of slow
                geography-bound servers, your site is lifted into a global cloud
                of servers ready to be delivered instantly to your users
                wherever they are.
              </p>
            </div>
          </div>
          <div>
            <h1>How Gatsby works</h1>
            <img
              src={this.props.data.file.childImageSharp.responsiveSizes.src}
              srcSet={
                this.props.data.file.childImageSharp.responsiveSizes.srcSet
              }
              sizes={this.props.data.file.childImageSharp.responsiveSizes.sizes}
            />
          </div>
        </Container>
      </div>
    )
  },
})

export default IndexRoute

export const pageQuery = graphql`
  query Index {
    site {
      siteMetadata {
        title
      }
    }
    file(relativePath: { eq: "gatsby-explanation.png" }) {
      childImageSharp {
        responsiveSizes(maxWidth: 870) {
          src
          srcSet
          sizes
        }
      }
    }
  }
`

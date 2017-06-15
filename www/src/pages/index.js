import React from "react"
import Link from "gatsby-link"
import { rhythm, scale, options } from "../utils/typography"
import Container from "../components/container"
import presets from "../utils/presets"
import colors from "../utils/colors"
import fabricPattern from "../argyle.png"

const IndexRoute = React.createClass({
  render() {
    return (
      <div>
        <div
          css={{
            // background: `#744c9e`,
            background: presets.purple,
            backgroundImage: `url("${fabricPattern}")`,
            // backgroundImage: `url("http://www.transparenttextures.com/patterns/argyle.png")`,
            // backgroundImage: `linear-gradient(135deg,${colors.b[14]},${colors
            // .b[13]},${colors.b[12]})`,
            paddingBottom: rhythm(1),
          }}
        >
          <Container hasSideBar={false}>
            <h1
              css={{
                marginTop: rhythm(1),
                marginBottom: rhythm(1.5),
                color: `white`,
                ...scale(2),
                lineHeight: 0.9,
                [presets.Mobile]: {
                  lineHeight: 1,
                },
              }}
            >
              Blazing-fast React.js static site generator
            </h1>
            <div>
              <Link
                css={{
                  ...scale(2 / 5),
                  border: `1px solid white`,
                  display: `inline-block`,
                  fontFamily: options.headerFontFamily.join(`,`),
                  padding: `${rhythm(1 / 2)} ${rhythm(1)}`,
                  // Increase specificity
                  "&&": {
                    boxShadow: `none`,
                    color: `white`,
                    ":hover": { background: `white`, color: `#744c9e` },
                  },
                }}
                to="/docs/"
              >
                Get Started
              </Link>
            </div>
          </Container>
        </div>
        <Container hasSideBar={false}>
          <div css={{ display: `flex`, flexWrap: `wrap` }}>
            <div
              css={{
                flex: `0 0 100%`,
                [presets.Tablet]: { flex: 1, paddingRight: rhythm(2) },
              }}
            >
              <h3>Modern web tech without the headache</h3>
              <p>
                Enjoy all the power of the latest web technologies without
                the headache. React.js, webpack, modern JavaScript and
                CSS and more are all setup and waiting for you to start
                building.
              </p>
            </div>
            <div css={{ flex: 1 }}>
              <h3>Bring your own data</h3>
              <p>
                Gatsby’s rich data plugin ecosystem lets you build sites
                with the data you want. Integrate data from one or many
                sources: headless CMSs, SaaS services, APIs, databases, your
                file system, and more. Pull data directly into your pages using
                GraphQL.
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
              <h3>Scale to the entire internet</h3>
              <p>
                Gatsby.js is Internet Scale. Forget complicated deploys with
                databases and servers and their expensive, time-consuming setup
                costs, maintenance, and scaling fears. Gatsby.js builds your
                site as “static” files which can be deployed easily on dozens
                of services.
              </p>
            </div>
            <div css={{ flex: 1 }}>
              <h3>Future-proof your website</h3>
              <p>
                Don't build a website with last decade's tech. The future of
                the web is mobile, JavaScript and APIs—the {" "}
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
              <h3><em>Static</em> Progessive Web Apps</h3>
              <p>
                Gatsby.js is a static PWA (Progressive Web App) generator. You
                get code and data splitting out-of-the-box. Gatsby loads an
                HTML file that’s a server rendered version of your React.js
                page then makes it live with JavaScript. Code and data for
                other pages get preloaded so clicking around the site feels
                incredibly fast.
              </p>
            </div>
            <div css={{ flex: 1 }}>
              <h3>Speed past the competition</h3>
              <p>
                Gatsby.js builds the fastest possible website. Instead of slow
                geography-bound servers, your site is lifted into a global
                cloud of servers ready to be delivered instantly to your users
                wherever they are.
              </p>
            </div>
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
}
`

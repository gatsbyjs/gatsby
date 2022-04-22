// If you don't want to use TypeScript you can delete this file!
import * as React from "react"
import { PageProps, Link, graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

type DataProps = {
  site: {
    buildTime: string
  }
}

const UsingTypescript: React.FC<PageProps<DataProps>> = ({ data, path }) => (
  <Layout>
    <Seo title="Using TypeScript" />
    <h1>
      Gatsby supports
      <br />
      <b>TypeScript by default</b>
    </h1>
    <p>
      This means that you can create and write <code>.ts/.tsx</code> files for
      your pages, components etc. Please note that the <code>gatsby-*.js</code>{" "}
      files (like <code>gatsby-node.js</code>) currently don't support
      TypeScript yet.
    </p>
    <p>
      For type checking you'll want to install <code>typescript</code> via npm
      and run <code>tsc --init</code> to create a <code>tsconfig</code> file.
    </p>
    <p>
      You're currently on the page "{path}" which was built on{" "}
      {data.site.buildTime}.
    </p>
    <p>
      To learn more, head over to our{" "}
      <a href="https://www.gatsbyjs.com/docs/typescript/">
        documentation about TypeScript
      </a>
      .
    </p>
    <Link to="/">Go back to the homepage</Link>
  </Layout>
)

export default UsingTypescript

export const query = graphql`
  {
    site {
      buildTime(formatString: "YYYY-MM-DD hh:mm a z")
    }
  }
`

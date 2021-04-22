import { graphql } from "gatsby"
import * as React from "react"
import slugify from "slugify"

import Layout from "../components/layout"

const BooleanPage = ({ data }) => {
  const entries = data.allContentfulBoolean.nodes
  return (
    <Layout>
      {entries.map(({ title, boolean }) => {
        const slug = slugify(title, { strict: true, lower: true })
        return (
          <div data-cy-id={slug} key={slug}>
            <h2>{title}</h2>
            <p data-cy-value>{JSON.stringify(boolean)}</p>
          </div>
        )
      })}
    </Layout>
  )
}

export default BooleanPage

export const pageQuery = graphql`
  query BooleanQuery {
    allContentfulBoolean(sort: { fields: sys___id }) {
      nodes {
        title
        boolean
      }
    }
  }
`

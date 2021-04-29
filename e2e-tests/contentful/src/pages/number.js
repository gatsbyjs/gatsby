import { graphql } from "gatsby"
import * as React from "react"
import slugify from "slugify"

import Layout from "../components/layout"

const NumberPage = ({ data }) => {
  const entries = data.allContentfulNumber.nodes
  return (
    <Layout>
      {entries.map(({ title, integer, decimal }) => {
        const slug = slugify(title, { strict: true, lower: true })
        return (
          <div data-cy-id={slug} key={slug}>
            <h2>{title}</h2>
            <p data-cy-value>{integer ? integer : decimal}</p>
          </div>
        )
      })}
    </Layout>
  )
}

export default NumberPage

export const pageQuery = graphql`
  query NumberQuery {
    allContentfulNumber(sort: { fields: sys___id }) {
      nodes {
        title
        integer
        decimal
      }
    }
  }
`

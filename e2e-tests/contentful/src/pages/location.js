import { graphql } from "gatsby"
import * as React from "react"
import slugify from "slugify"

import Layout from "../components/layout"

const LocationPage = ({ data }) => {
  const entries = data.allContentfulLocation.nodes
  return (
    <Layout>
      {entries.map(({ title, location }) => {
        const slug = slugify(title, { strict: true, lower: true })
        return (
          <div data-cy-id={slug} key={slug}>
            <h2>{title}</h2>
            <p>
              Lat: <span data-cy-value-lat>{location.lat}</span> Long:{" "}
              <span data-cy-value-lon>{location.lon}</span>
            </p>
          </div>
        )
      })}
    </Layout>
  )
}

export default LocationPage

export const pageQuery = graphql`
  query LocationQuery {
    allContentfulLocation(sort: { fields: contentful_id }) {
      nodes {
        title
        location {
          lat
          lon
        }
      }
    }
  }
`

import { graphql } from "gatsby"
import * as React from "react"
import slugify from "slugify"

import Layout from "../components/layout"

const LocationPage = ({ data }) => {
  const defaultEntries = data.default.nodes
  const englishEntries = data.english.nodes
  const germanEntries = data.german.nodes
  return (
    <Layout>
      {defaultEntries.map(({ title, location }) => {
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
      <h1>English Locale</h1>
      {englishEntries.map(({ title, locationLocalized }) => {
        const slug = slugify(title, { strict: true, lower: true })
        return (
          <div data-cy-id={"english"} key={slug}>
            <h2>{title}</h2>
            <p>
              Lat: <span data-cy-value-lat>{locationLocalized.lat}</span> Long:{" "}
              <span data-cy-value-lon>{locationLocalized.lon}</span>
            </p>
          </div>
        )
      })}
      <h1>German Locale</h1>
      {germanEntries.map(({ title, locationLocalized }) => {
        const slug = slugify(title, { strict: true, lower: true })
        return (
          <div data-cy-id={"german"} key={slug}>
            <h2>{title}</h2>
            <p>
              Lat: <span data-cy-value-lat>{locationLocalized.lat}</span> Long:{" "}
              <span data-cy-value-lon>{locationLocalized.lon}</span>
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
    default: allContentfulContentTypeLocation(
      sort: { fields: sys___id }
      filter: {
        title: { glob: "!*Localized*" }
        sys: { locale: { eq: "en-US" } }
      }
    ) {
      nodes {
        title
        location {
          lat
          lon
        }
      }
    }
    english: allContentfulContentTypeLocation(
      sort: { fields: sys___id }
      filter: {
        title: { glob: "*Localized*" }
        sys: { locale: { eq: "en-US" } }
      }
    ) {
      nodes {
        title
        locationLocalized {
          lat
          lon
        }
      }
    }
    german: allContentfulContentTypeLocation(
      sort: { fields: sys___id }
      filter: {
        title: { glob: "*Localized*" }
        sys: { locale: { eq: "de-DE" } }
      }
    ) {
      nodes {
        title
        locationLocalized {
          lat
          lon
        }
      }
    }
  }
`

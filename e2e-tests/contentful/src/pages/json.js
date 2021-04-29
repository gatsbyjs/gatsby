import { graphql } from "gatsby"
import * as React from "react"
import slugify from "slugify"

import Layout from "../components/layout"

const JSONPage = ({ data }) => {
  const simple = data.simple.json
  const actors = data.complex.json.Actors
  const english = data.english.jsonLocalized
  const german = data.german.jsonLocalized
  return (
    <Layout>
      <h1>Simple:</h1>
      <div data-cy-id="simple">
        <p data-cy-value-name>Name: {simple.name}</p>
        <p data-cy-value-city>City: {simple.city}</p>
        <p data-cy-value-age>Age: {simple.age}</p>
      </div>
      <h1>Complex:</h1>
      <div data-cy-id="complex">
        {actors.map(actor => (
          <div
            key={`actor-${slugify(actor.name, { strict: true, lower: true })}`}
            style={{
              border: "1px dashed grey",
              padding: "0 1rem",
              margin: "1rem 0",
            }}
          >
            <p>Name: {actor.name}</p>
            <p>Photo: {actor.photo}</p>
            <p>Birthdate: {actor.Birthdate}</p>
            <p>Born at: {actor["Born At"]}</p>
            <p>Weight: {actor.weight}</p>
            <p>Age: {actor.age}</p>
            <p>Wife: {actor.wife}</p>
            <p>Children: {actor.children.join(", ")}</p>
            <p>Has children: {JSON.stringify(actor.hasChildren)}</p>
            <p>Has grey hair: {JSON.stringify(actor.hasGreyHair)}</p>
          </div>
        ))}
      </div>
      <h1>English:</h1>
      <div data-cy-id="english">
        <p data-cy-value-name>Name: {english.name}</p>
        <p data-cy-value-city>City: {english.city}</p>
        <p data-cy-value-age>Age: {english.age}</p>
      </div>
      <h1>German:</h1>
      <div data-cy-id="german">
        <p data-cy-value-name>Name: {german.name}</p>
        <p data-cy-value-city>City: {german.city}</p>
        <p data-cy-value-age>Age: {german.age}</p>
      </div>
    </Layout>
  )
}

export default JSONPage

export const pageQuery = graphql`
  query JSONQuery {
    simple: contentfulJson(sys: { id: { eq: "2r6tNjP8brkyy5yLR39hhh" } }) {
      json
    }
    complex: contentfulJson(sys: { id: { eq: "2y71nV0cpW9vzTmJybq571" } }) {
      json
    }
    english: contentfulJson(
      sys: { id: { eq: "7DvTBEPg5P6TRC7dI9zXuO" }, locale: { eq: "en-US" } }
    ) {
      title
      jsonLocalized
    }
    german: contentfulJson(
      sys: { id: { eq: "7DvTBEPg5P6TRC7dI9zXuO" }, locale: { eq: "de-DE" } }
    ) {
      title
      jsonLocalized
    }
  }
`

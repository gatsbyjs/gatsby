import { graphql } from "gatsby"
import * as React from "react"
import slugify from "slugify"

import Layout from "../components/layout"

const JSONPage = ({ data }) => {
  const simple = data.simple.json
  const actors = data.complex.json.Actors

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
            <p data-cy-value-name>Name: {actor.name}</p>
            <p data-cy-value-photo>Photo: {actor.photo}</p>
            <p data-cy-value-birthdate>Birthdate: {actor.Birthdate}</p>
            <p data-cy-value-born-at>Born at: {actor["Born At"]}</p>
            <p data-cy-value-weight>Weight: {actor.weight}</p>
            <p data-cy-value-age>Age: {actor.age}</p>
            <p data-cy-value-wife>Wife: {actor.wife}</p>
            <p data-cy-value-children>Children: {actor.children.join(", ")}</p>
            <p data-cy-value-has-children>
              Has children: {JSON.stringify(actor.hasChildren)}
            </p>
            <p data-cy-value-has-grey-hair>
              Has grey hair: {JSON.stringify(actor.hasGreyHair)}
            </p>
          </div>
        ))}
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
  }
`

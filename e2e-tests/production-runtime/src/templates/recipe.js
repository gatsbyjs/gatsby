import React from "react"
import { Slice } from "gatsby"
import Layout from "../components/layout"

const Recipe = ({ pageContext: { description, name } }) => {
  return (
    <Layout>
      <h1 data-testid="recipe-name">{name}</h1>
      <p data-testid="recipe-description">{description}</p>
      <Slice alias="author" />
    </Layout>
  )
}

export default Recipe

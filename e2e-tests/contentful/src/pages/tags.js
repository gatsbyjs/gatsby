import { graphql } from "gatsby"
import * as React from "react"
import slugify from "slugify"

import Layout from "../components/layout"

const TagsPage = ({ data }) => {
  const tags = data.tags.nodes
  const integers = data.integers.nodes
  const decimals = data.decimals.nodes
  const assets = data.assets.nodes

  return (
    <Layout>
      <h1>Tag Listing:</h1>
      {tags.map(tag => {
        return (
          <div data-cy-id={`tag-${tag.contentful_id}`} key={tag.contentful_id}>
            <h2 data-cy-name>{tag.name}</h2>
            <p>
              ID: <span data-cy-id>{tag.contentful_id}</span>
            </p>
          </div>
        )
      })}
      <hr />
      <h1>Filtered Entries:</h1>
      <h2>Integers:</h2>
      <div data-cy-integers>
        {integers.map(({ title, integer }) => {
          const slug = slugify(title, { strict: true, lower: true })
          return (
            <div data-cy-id={slug} key={slug}>
              <h3>{title}</h3>
              <p data-cy-value>{integer}</p>
            </div>
          )
        })}
      </div>
      <h2>Decimals:</h2>
      <div data-cy-decimals>
        {decimals.map(({ title, decimal }) => {
          const slug = slugify(title, { strict: true, lower: true })
          return (
            <div data-cy-id={slug} key={slug}>
              <h3>{title}</h3>
              <p data-cy-value>{decimal}</p>
            </div>
          )
        })}
      </div>
      <hr />
      <h1>Assets:</h1>
      <div
        data-cy-assets
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        {assets.map(({ title, file, metadata }) => {
          const slug = slugify(title, { strict: true, lower: true })
          return (
            <div data-cy-id={slug} key={slug}>
              <h3>{title}</h3>
              <img
                src={`${file.url}?w=300&h=300&fit=thumb&f=face`}
                style={{ width: 300 }}
                alt={title}
              />
              <div data-cy-value>
                {metadata.tags.map(({ name }) => (
                  <span
                    style={{
                      background: "tomato",
                      borderRadius: "1rem",
                      color: "white",
                      display: "inline-block",
                      margin: "1rem 1rem 1rem 0",
                      padding: "0.3rem 1rem",
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}

export default TagsPage

export const pageQuery = graphql`
  query TagsQuery {
    tags: allContentfulTag(sort: { fields: contentful_id }) {
      nodes {
        name
        contentful_id
      }
    }
    integers: allContentfulNumber(
      sort: { fields: contentful_id }
      filter: {
        metadata: {
          tags: { elemMatch: { contentful_id: { eq: "numberInteger" } } }
        }
        node_locale: { eq: "en-US" }
      }
    ) {
      nodes {
        title
        integer
      }
    }
    decimals: allContentfulNumber(
      sort: { fields: contentful_id }
      filter: {
        metadata: {
          tags: { elemMatch: { contentful_id: { eq: "numberDecimal" } } }
        }
        node_locale: { eq: "en-US" }
      }
    ) {
      nodes {
        title
        decimal
      }
    }
    assets: allContentfulAsset(
      sort: { fields: contentful_id }
      filter: {
        metadata: { tags: { elemMatch: { contentful_id: { eq: "animal" } } } }
        node_locale: { eq: "en-US" }
      }
    ) {
      nodes {
        title
        file {
          url
        }
        metadata {
          tags {
            name
          }
        }
      }
    }
  }
`

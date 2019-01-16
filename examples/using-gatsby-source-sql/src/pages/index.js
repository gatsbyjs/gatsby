import React from 'react'
import { Link, graphql } from 'gatsby'

import Layout from '../components/layout'

const IndexPage = ({ data }) => (
  <Layout>
    <h2>Catalogue</h2>
    <table>
      <caption>Table 1. Classical Music Catalogue</caption>
      <thead>
        <tr>
          <th>Track</th>
          <th>Artist</th>
        </tr>
      </thead>
      <tbody>
        {data.allClassical.edges.map(({ node }) => (
          <tr key={`track-${node.TrackId}`}>
            <td>{node.Track}</td>
            <td>{node.Artist}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <h2>Lorem Articles</h2>
    {data.allArticle.edges && (
      <ul>
        {data.allArticle.edges.map(({ node }) => (
          <li key={`article-${node.id}`}>
            <Link to={`/${node.slug}`}>{node.title}</Link>
          </li>
        ))}
      </ul>
    )}
    <Link to="/page-2/">Go to page 2</Link>
  </Layout>
)

export default IndexPage

export const query = graphql`
  query {
    allClassical(sort: { fields: [Artist], order: ASC }, limit: 10) {
      edges {
        node {
          id
          TrackId
          Track
          Artist
          Album
          Genre
        }
      }
    }
    allArticle {
      edges {
        node {
          id
          title
          slug
        }
      }
    }
  }
`

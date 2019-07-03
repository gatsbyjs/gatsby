import React from 'react'
import { graphql } from 'gatsby'

import Layout from '../components/layout'

const CircularReferencePage = ({ data: { contentfulTest1: data } }) => (
  <Layout>
    <p data-testid="first">{data.name}</p>
    <p data-testid="second">{data.reference.name}</p>
    <p data-testid="third">{data.reference.reference.name}</p>
  </Layout>
)

export const query = graphql`
  query CircularReferenceQuery {
    contentfulTest1 {
      name
      reference {
        name
        reference {
          name
        }
      }
    }
  }
`

export default CircularReferencePage

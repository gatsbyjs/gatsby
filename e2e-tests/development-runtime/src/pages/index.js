import React from 'react'
import { Link } from 'gatsby'

import ClassComponent from '../components/class-component'
import Layout from '../components/layout'
import Image from '../components/image'
import SEO from '../components/seo'

const IndexPage = () => (
  <Layout>
    <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
    <h1>Hi people</h1>
    <p data-testid="page-component">Welcome to your new %GATSBY_SITE%</p>
    <p>Now go build something great.</p>
    <ClassComponent />
    <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
      <Image />
    </div>
    <Link to="/page-2/" data-testid="page-two">
      Go to page 2
    </Link>
    <Link to="/__non_existant_page__/" data-testid="broken-link">
      Go to a broken link
    </Link>
  </Layout>
)

export default IndexPage

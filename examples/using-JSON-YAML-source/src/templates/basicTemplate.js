import React from 'react'
import uuid from 'uuid'
import Layout from '../components/layout'
import SEO from '../components/seo'
import { Link } from 'gatsby'
const basicTemplate = props => {
  const { pageContext } = props
  const { pageContent, links } = pageContext

  return (
    <Layout>
      <SEO
        title={`page created using basic json`}
        keywords={[`gatsby`, `application`, `react`]}
      />
      <div>
        {pageContent.map(data => (
          <div key={uuid.v4()}>{data.item}</div>
        ))}
      </div>
      <div>
        {links.map(item => (
          <div key={`linked_${uuid.v4()}`}>
            <Link to={item.to}>{item.to}</Link>
          </div>
        ))}
      </div>
    </Layout>
  )
}
export default basicTemplate

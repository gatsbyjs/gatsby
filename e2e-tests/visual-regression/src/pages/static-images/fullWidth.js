import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"
import { TestWrapper } from "../../components/test-wrapper"
import Layout from "../../components/layout"

const Page = () => {
  return (
    <Layout>
      <h1>Fluid, width</h1>
      <TestWrapper style={{ display: `block` }}>
        <StaticImage
          src="../../images/cornwall.jpg"
          loading="eager"
          layout="fullWidth"
          alt="cornwall"
        />
      </TestWrapper>
    </Layout>
  )
}

export default Page

import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"
import { TestWrapper } from "../../components/test-wrapper"
import Layout from "../../components/layout"

const Page = () => {
  return (
    <Layout>
      <h1>Constrained</h1>
      <TestWrapper>
        <StaticImage
          src="../../images/cornwall.jpg"
          alt="cornwall"
          width={1024}
        />
      </TestWrapper>
    </Layout>
  )
}

export default Page

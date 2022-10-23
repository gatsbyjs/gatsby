import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"
import { TestWrapper } from "../../components/test-wrapper"
import Layout from "../../components/layout"

const Page = () => {
  return (
    <Layout>
      <h1>Defining sharp props</h1>
      <TestWrapper>
        <StaticImage
          src="../../images/cornwall.jpg"
          loading="eager"
          width={300}
          alt="cornwall"
          layout="fixed"
          outputPixelDensities={[1, 2, 3]}
        />
      </TestWrapper>
    </Layout>
  )
}

export default Page

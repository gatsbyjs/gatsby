import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"
import { TestWrapper } from "../../components/test-wrapper"
import Layout from "../../components/layout"

const Page = () => {
  return (
    <Layout>
      <h1>Fixed width and height</h1>
      <TestWrapper>
        <StaticImage
          src="../../images/cornwall.jpg"
          loading="eager"
          width={240}
          height={100}
          alt="cornwall"
          layout="fixed"
        />
      </TestWrapper>
    </Layout>
  )
}

export default Page

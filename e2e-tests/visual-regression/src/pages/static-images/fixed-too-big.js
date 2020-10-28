import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"
import { TestWrapper } from "../../components/test-wrapper"
import Layout from "../../components/layout"

const Page = () => {
  return (
    <Layout>
      <h1>Fixed larger than source image</h1>
      <TestWrapper>
        <StaticImage
          src="../../images/landsend.jpg"
          loading="eager"
          layout="fixed"
          width={500}
          height={500}
          alt="landsend"
        />
      </TestWrapper>
    </Layout>
  )
}

export default Page

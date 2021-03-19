import React from "react"
import { StaticImage } from "gatsby-plugin-image"
import PageTitle from "../components/page-title"

import Layout from "../components/layout"

const StaticImages = ({ location }) => (
  <Layout location={location}>
    <PageTitle>Static Image</PageTitle>
    <StaticImage
      src="https://images.unsplash.com/photo-1597305877032-0668b3c6413a?w=1300"
      alt={`“Studio shot of the monstera plant leaf” by Severin Candrian (via unsplash.com)`}
      height={300}
    />
    <p>
      When you know the specific image you want to use on a page will never
      change you can use the <strong>StaticImage</strong> component. It gives
      you the same benefits of <strong>GatsbyImage</strong> with the ease of use
      of an img tag. The <code>src</code> can be a relative path or a URL. All
      options available via the GraphQL resolver can be passed via props to{" "}
      <strong>StaticImage</strong>.
    </p>
    <StaticImage
      src="https://images.unsplash.com/photo-1517423738875-5ce310acd3da?w=1305"
      alt={`"Toshi dressed as Totoro" by Charles Deluvio (via unsplash.com)`}
    />
  </Layout>
)

export default StaticImages

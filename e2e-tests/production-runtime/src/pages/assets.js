import * as React from "react"
import Layout from "../components/layout"
import astronaut from "../images/gatsby-astronaut.png"
import pdf from "../files/pdf-example.pdf"

import Seo from "../components/seo"

const Assets = () => (
  <Layout>
    <h2 className="merriweather-300">Font</h2>
    <h2 className="merriweather-300-italic">Font Italic</h2>
    <img
      data-testid="assets-img-static-folder"
      src="../gatsby-astronaut.png"
      alt="Gatsby Astronaut Static Folder"
    />
    <img
      data-testid="assets-img-import"
      src={astronaut}
      alt="Gatsby Astronaut"
    />
    <a data-testid="assets-pdf-import" href={pdf}>
      Download PDF
    </a>
  </Layout>
)

export const Head = () => <Seo />

export default Assets

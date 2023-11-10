import React from "react"

import RemoteFileComponent from "gatsby-cypress/remote-file/component.jsx"
import Layout from "../components/layout"
import Seo from "../components/seo"

const RemoteFile = () => {
  return (
    <Layout>
      <RemoteFileComponent />
    </Layout>
  )
}

export const Head = () => <Seo title="Remote file" />

export default RemoteFile

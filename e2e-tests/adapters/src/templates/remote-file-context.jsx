import React from "react"

import RemoteFileComponent from "gatsby-cypress/remote-file/component.jsx"
import Layout from "../components/layout"

const RemoteFile = ({ pageContext }) => {
  return (
    <Layout>
      <RemoteFileComponent contextData={pageContext.remoteFile} />
    </Layout>
  )
}

export default RemoteFile

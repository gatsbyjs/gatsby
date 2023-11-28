import React from "react"
import { graphql } from "gatsby"

import RemoteFileComponent from "gatsby-cypress/remote-file/component.jsx"
import Layout from "../../../components/layout"

const RemoteFileSSR = ({ data }) => {
  return (
    <Layout>
      <RemoteFileComponent contextData={data} publicUrl={false} />
    </Layout>
  )
}

export default RemoteFileSSR

export function getServerData(arg) {
  return {
    props: {
      ssr: true,
      arg,
    },
  }
}

export const query = graphql`
  {
    allMyRemoteFile {
      nodes {
        id
        alias: id
        url
        filename
        # FILE_CDN is kind of borked in SSR/DSG in general (not just with adapters)
        # so we're not testing it yet
        # publicUrl
        resize(width: 100) {
          height
          width
          src
        }
        #
        fixed: gatsbyImage(layout: FIXED, width: 100, placeholder: NONE)
        constrained: gatsbyImage(
          layout: CONSTRAINED
          width: 300
          placeholder: NONE
        )
        constrained_traced: gatsbyImage(
          layout: CONSTRAINED
          width: 300
          placeholder: NONE
        )
        full: gatsbyImage(layout: FULL_WIDTH, width: 500, placeholder: NONE)
      }
    }
  }
`

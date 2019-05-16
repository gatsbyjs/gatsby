import React from "react"

import DirectoryList from "./directory-list"
import FileList from "./file-list"
import Breadcrumbs from "./breadcrumbs"
import Layout from "./layout"

export default ({ directories, files, breadcrumbs = [] }) => (
  <Layout>
    {breadcrumbs.length ? <Breadcrumbs links={breadcrumbs} /> : null}
    <DirectoryList directories={directories} />
    <FileList files={files} />
  </Layout>
)

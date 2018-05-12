import React from 'react'
import NotebookPreview from '@nteract/notebook-preview'

export default ({ data }) => {
  const post = data.jupyterNotebook
  const notebookJSON = JSON.parse(post.internal.content)
  return <NotebookPreview notebook={notebookJSON} />
}

export const query = graphql`
  query BlogPostQuery($slug: String!) {
    jupyterNotebook(fields: { slug: { eq: $slug } }) {
      internal {
        content
      }
    }
  }
`

import React from 'react'
import Link from 'gatsby-link'

const IndexPage = () => (
  <div>
    <h1>Some examples of jupyter notebooks</h1>
    <p>
      The notebooks are displayed using react component
      <code>NotebookPreview</code>
      from{' '}
      <Link to="https: //github.com/nteract/nteract/tree/master/packages/notebook-preview">
        {' '}
        @nteract/notebook-preview.
      </Link>{' '}
    </p>
    <ul>
      <li>
        <Link to="/minimal-nodejs-notebook/">minimal - nodejs - notebook</Link>
      </li>
      <li>
        <Link to="/XKCD_plots/"> XKCD_plots by by Jake Vanderplas </Link>
      </li>
      <li>
        <Link to="/Three-Body Problem/">
          Three - Body Problem by Paulo Marques
        </Link>
      </li>
    </ul>
  </div>
)

export default IndexPage

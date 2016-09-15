import React from 'react'
import { prefixLink } from './gatsby-helpers'

let stats
try {
  stats = require('public/stats.json')
} catch (e) {
  // ignore
}

const HTMLScripts = ({ scripts }) => {
  let scriptComponents
  if (process.env.NODE_ENV === 'production') {
    scriptComponents = scripts.map((script) => (
      <script key={script} src={prefixLink(`/${stats.assetsByChunkName[script][0]}`)} />
    ))
  } else {
    scriptComponents = <script src={prefixLink('/commons.js')} />
  }

  return (
    <div>{scriptComponents}</div>
  )
}

module.exports = HTMLScripts

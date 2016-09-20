import React from 'react'
import { prefixLink } from './gatsby-helpers'
import get from 'lodash/get'

let stats
try {
  stats = require(`public/stats.json`)
} catch (e) {
  // ignore
}

const HTMLScripts = ({ scripts }) => {
  let scriptComponents
  if (process.env.NODE_ENV === `production`) {
    scriptComponents = scripts.map((script) => {
      const fetchKey = `assetsByChunkName[${script}][0]`
      return (
        <script key={script} src={prefixLink(`/${get(stats, fetchKey, ``)}`)} />
      )
    })
  } else {
    scriptComponents = <script src={prefixLink(`/${scripts[0]}.js`)} />
  }

  return (
    <div>{scriptComponents}</div>
  )
}

HTMLScripts.propTypes = {
  scripts: React.PropTypes.array.isRequired,
}

module.exports = HTMLScripts

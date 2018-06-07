import defineAssetScript from '../define-asset-script'
import get from 'lodash/get'
import isArray from 'lodash/isArray'

const mockStats = require(`../json/mock-stats-object`)

describe(`define-asset-script`, () => {
  it(`should mutate "ChartBar.js" rel item to "prefetch"`, () => {
    const linkComponent = [`About`,`ChartBar`, `foo`, `main`].map(s => { 
      const fetchKey = `assetsByChunkName[${s}]`
      const fetchedEntryPoints = get(mockStats, `entrypoints`)

      let fetchedScript = get(mockStats, fetchKey)
      fetchedScript = isArray(fetchedScript) ? fetchedScript[0] : fetchedScript
      return defineAssetScript(fetchedEntryPoints, fetchedScript, { rel: `preload`, prefixedScript: fetchedScript })
    })

    linkComponent.forEach(({ rel, prefixedScript }) => {
      if(prefixedScript === `ChartBar.js`) {
        expect(rel).toBe(`prefetch`)
      } else {
        expect(rel).toBe(`preload`)
      }
    })
  })
})
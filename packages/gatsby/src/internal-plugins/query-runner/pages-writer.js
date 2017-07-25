const _ = require(`lodash`)
const glob = require(`glob`)
const fs = require(`fs-extra`)

const { store, emitter } = require(`../../redux/`)
import { generatePathChunkName } from "../../utils/js-chunk-names"

import { joinPath } from "../../utils/path"

const getLayoutById = layouts => id => layouts.find(l => l.id === id)

// Write out pages information.
const writePages = async () => {
  writtenOnce = true
  let { program, config, pages, layouts } = store.getState()
  // Write out pages.json
  const pagesData = pages.reduce(
    (mem, { path, matchPath, componentChunkName, layout, jsonName }) => {
      const layoutOjb = getLayoutById(layouts)(layout)
      return [
        ...mem,
        {
          componentChunkName,
          layout,
          layoutComponentChunkName: layoutOjb && layoutOjb.componentChunkName,
          layoutJsonName: layoutOjb && layoutOjb.jsonName,
          jsonName,
          path,
          matchPath,
        },
      ]
    },
    []
  )

  // Get list of components, layouts, and json files.
  let components = []
  let json = []
  let pageLayouts = []

  pages.forEach(p => {
    components.push({
      componentChunkName: p.componentChunkName,
      component: p.component,
    })
    if (p.layout) {
      let layout = getLayoutById(layouts)(p.layout)
      pageLayouts.push(layout)
      json.push({
        jsonName: layout.jsonName,
      })
    }
    json.push({ path: p.path, jsonName: p.jsonName })
  })

  // Add the default layout if it exists.
  let defaultLayoutExists = false
  pageLayouts = _.uniq(pageLayouts)
  components = _.uniqBy(components, c => c.componentChunkName)

  await fs.writeFile(
    joinPath(program.directory, `.cache/pages.json`),
    JSON.stringify(pagesData, null, 4)
  )

  // Create file with sync requires of layouts/components/json files.
  let syncRequires = `// prefer default export if available
const preferDefault = m => m && m.default || m
\n\n`
  syncRequires += `exports.components = {\n${components
    .map(
      c =>
        `  "${c.componentChunkName}": preferDefault(require("${joinPath(
          c.component
        )}"))`
    )
    .join(`,\n`)}
}\n\n`
  syncRequires += `exports.json = {\n${json
    .map(
      j =>
        `  "${j.jsonName}": require("${joinPath(
          program.directory,
          `/.cache/json/`,
          j.jsonName
        )}")`
    )
    .join(`,\n`)}
}\n\n`
  syncRequires += `exports.layouts = {\n${pageLayouts
    .map(l => `  "${l.componentChunkName}": preferDefault(require("${joinPath(
        l.component
      )}"))`)
    .join(`,\n`)}
}`

  await fs.writeFile(
    `${program.directory}/.cache/sync-requires.js`,
    syncRequires
  )
  // Create file with async requires of layouts/components/json files.
  let asyncRequires = `// prefer default export if available
const preferDefault = m => m && m.default || m
\n`
  asyncRequires += `exports.components = {\n${components
    .map(
      c =>
        `  "${c.componentChunkName}": require("gatsby-module-loader?name=${c.componentChunkName}!${joinPath(
          c.component
        )}")`
    )
    .join(`,\n`)}
}\n\n`
  asyncRequires += `exports.json = {\n${json
    .map(
      j =>
        `  "${j.jsonName}": require("gatsby-module-loader?name=${generatePathChunkName(
          j.path
        )}!${joinPath(program.directory, `/.cache/json/`, j.jsonName)}")`
    )
    .join(`,\n`)}
}\n\n`
  asyncRequires += `exports.layouts = {\n${pageLayouts
    .map(l => `  "${l.componentChunkName}": require("gatsby-module-loader?name=${l.componentChunkName}!${joinPath(
        l.component
      )}")`)
    .join(`,\n`)}
}`

  await fs.writeFile(
    joinPath(program.directory, `.cache/async-requires.js`),
    asyncRequires
  )

  return
}

exports.writePages = writePages

let writtenOnce = false
let oldPages
const debouncedWritePages = _.debounce(() => {
  if (!writtenOnce || !_.isEqual(oldPages, store.getState().pages)) {
    writePages()
    oldPages = store.getState().pages
  }
}, 250)

emitter.on(`CREATE_PAGE`, () => {
  debouncedWritePages()
})
emitter.on(`DELETE_PAGE_BY_PATH`, () => {
  debouncedWritePages()
})

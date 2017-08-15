const _ = require(`lodash`)
const glob = require(`glob`)
const fs = require(`fs-extra`)

const { store, emitter } = require(`../../redux/`)
import { pathChunkName } from "../../utils/js-chunk-names"

import { joinPath } from "../../utils/path"

// Write out pages information.
const writePages = async () => {
  writtenOnce = true
  const { program, pages } = store.getState()

  // Write out pages.json
  const pagesData = pages.reduce(
    (mem, { path, matchPath, componentChunkName, layout, jsonName }) => [
      ...mem,
      { componentChunkName, layout, jsonName, path, matchPath },
    ],
    []
  )

  // Get list of components, layouts, and json files.
  let components = []
  let layouts = []
  let json = []

  pages.forEach(p => {
    components.push({
      componentChunkName: p.componentChunkName,
      component: p.component,
    })
    if (p.layout) {
      layouts.push(p.layout)
    }
    json.push({ path: p.path, jsonName: p.jsonName })
  })

  // Add the default layout if it exists.
  if (
    glob.sync(joinPath(program.directory, `src/layouts/index.*`)).length !== 0
  ) {
    layouts.push(`index`)
  }

  layouts = _.uniq(layouts)
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
  syncRequires += `exports.layouts = {\n${layouts
    .map(l => {
      let componentName = l
      if (l !== false || typeof l !== `undefined`) {
        componentName = `index`
        return `  "${l}": preferDefault(require("${joinPath(
          program.directory,
          `/src/layouts/`,
          componentName
        )}"))`
      } else {
        return `  "${l}": false`
      }
    })
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
        `  "${j.jsonName}": require("gatsby-module-loader?name=${pathChunkName(
          j.path
        )}!${joinPath(program.directory, `/.cache/json/`, j.jsonName)}")`
    )
    .join(`,\n`)}
}\n\n`
  asyncRequires += `exports.layouts = {\n${layouts
    .map(layout => {
      let componentName = layout
      if (layout !== false || typeof layout !== `undefined`) {
        componentName = `index`
        return `  "${layout}": require("gatsby-module-loader?name=${`layout-component---${layout}`}!${joinPath(
          program.directory,
          `/src/layouts/`,
          componentName
        )}")`
      } else {
        return `  "${layout}": false`
      }
    })
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

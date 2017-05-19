const _ = require(`lodash`)
const glob = require(`glob`)
const parseFilepath = require(`parse-filepath`)
const fs = require(`fs`)

const { store } = require(`../redux/`)
import {
  layoutComponentChunkName,
  pathChunkName,
} from "../utils/js-chunk-names"

import { joinPath } from "../utils/path"

// Write out pages information.
const writePages = () => {
  const { program, config, pages } = store.getState()

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
  let defaultLayoutExists = false
  if (glob.sync(`${program.directory}/src/layouts/index.*`).length !== 0) {
    layouts.push(`index`)
    defaultLayoutExists = true
  }

  layouts = _.uniq(layouts)
  components = _.uniqBy(components, c => c.componentChunkName)

  fs.writeFile(
    `${program.directory}/.cache/pages.json`,
    JSON.stringify(pagesData, null, 4)
  )

  // Create file with sync requires of layouts/components/json files.
  let syncRequires = `// prefer default export if available
const preferDefault = m => m && m.default || m
\n\n`
  syncRequires += `exports.components = {\n${components
    .map(
      c =>
        `  "${c.componentChunkName}": preferDefault(require("${joinPath(c.component)}"))`
    )
    .join(`,\n`)}
}\n\n`
  syncRequires += `exports.json = {\n${json
    .map(
      j =>
        `  "${j.jsonName}": require("${joinPath(program.directory, `/.cache/json/`, j.jsonName)}")`
    )
    .join(`,\n`)}
}\n\n`
  syncRequires += `exports.layouts = {\n${layouts
    .map(l => {
      let componentName = l
      if (l !== false || typeof l !== `undefined`) {
        componentName = `index`
        return `  "${l}": preferDefault(require("${joinPath(program.directory, `/src/layouts/`, componentName)}"))`
      } else {
        return `  "${l}": false`
      }
    })
    .join(`,\n`)}
}`

  fs.writeFile(`${program.directory}/.cache/sync-requires.js`, syncRequires)
  // Create file with async requires of layouts/components/json files.
  let asyncRequires = `// prefer default export if available
const preferDefault = m => m && m.default || m
\n`
  asyncRequires += `exports.components = {\n${components
    .map(
      c =>
        `  "${c.componentChunkName}": require("bundle-loader?lazy&name=${c.componentChunkName}!${joinPath(c.component)}")`
    )
    .join(`,\n`)}
}\n\n`
  asyncRequires += `exports.json = {\n${json
    .map(
      j =>
        `  "${j.jsonName}": require("bundle-loader?lazy&name=${pathChunkName(j.path)}!${joinPath(program.directory, `/.cache/json/`, j.jsonName)}")`
    )
    .join(`,\n`)}
}\n\n`
  asyncRequires += `exports.layouts = {\n${layouts
    .map(layout => {
      let componentName = layout
      if (layout !== false || typeof layout !== `undefined`) {
        componentName = `index`
        return `  "${layout}": require("bundle-loader?lazy&name=${`layout-component---${layout}`}!${joinPath(program.directory, `/src/layouts/`, componentName)}")`
      } else {
        return `  "${layout}": false`
      }
    })
    .join(`,\n`)}
}`

  fs.writeFile(`${program.directory}/.cache/async-requires.js`, asyncRequires)
}

let writtenOnce = false
let oldPages
const debouncedWritePages = _.debounce(() => {
  if (!writtenOnce || !_.isEqual(oldPages, store.getState().pages)) {
    writePages()
    writtenOnce = true
    oldPages = store.getState().pages
  }
}, 250)

store.subscribe(() => {
  if (store.getState().lastAction.type === `UPSERT_PAGE`) {
    debouncedWritePages()
  }
})

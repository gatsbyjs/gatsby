const _ = require(`lodash`)
const fs = require(`fs-extra`)
const crypto = require(`crypto`)

const { store, emitter } = require(`../../redux/`)

import { joinPath } from "../../utils/path"

const getLayoutById = layouts => id => layouts.find(l => l.id === id)

let lastHash = null

// Write out pages information.
const writePages = async () => {
  bootstrapFinished = true
  let { program, jsonDataPaths, pages, layouts } = store.getState()

  const pagesComponentDependencies = {}

  // Write out pages.json
  const pagesData = pages.reduce(
    (mem, { path, matchPath, componentChunkName, layout, jsonName }) => {
      const layoutOjb = getLayoutById(layouts)(layout)

      const pageComponentsChunkNames = {
        componentChunkName,
        layoutComponentChunkName: layoutOjb && layoutOjb.componentChunkName,
      }

      if (program._[0] === `develop`) {
        pagesComponentDependencies[path] = pageComponentsChunkNames
      }

      return [
        ...mem,
        {
          ...pageComponentsChunkNames,
          layout: layoutOjb ? layoutOjb.machineId : layout,
          jsonName,
          path,
          matchPath,
        },
      ]
    },
    []
  )

  const newHash = crypto
    .createHash(`md5`)
    .update(JSON.stringify(pagesComponentDependencies))
    .digest(`hex`)

  if (newHash === lastHash) {
    // components didn't change - no need to rewrite pages.json
    return Promise.resolve()
  }

  lastHash = newHash

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
      const layoutDataPath = jsonDataPaths[layout.jsonName]
      if (!layout) {
        throw new Error(
          `Could not find layout '${
            p.layout
          }'. Check if this file exists in 'src/layouts'.`
        )
      }

      if (!_.includes(pageLayouts, layout)) {
        pageLayouts.push(layout)
        if (typeof layoutDataPath !== `undefined`) {
          json.push({
            jsonName: layout.jsonName,
            layoutDataPath,
          })
        }

        const wrapperComponent = `
        import React from "react"
        import Component from "${layout.component}"
        ${layoutDataPath &&
          `import data from "${joinPath(
            program.directory,
            `public`,
            `static`,
            `d`,
            `${layoutDataPath}.json`
          )}"`}


        export default (props) => <Component {...props}${layoutDataPath &&
          ` {...data}`} />
        `
        fs.writeFileSync(layout.componentWrapperPath, wrapperComponent)
      }
    }
    if (p.jsonName && jsonDataPaths[p.jsonName]) {
      json.push({ jsonName: p.jsonName, dataPath: jsonDataPaths[p.jsonName] })
    }
  })

  pageLayouts = _.uniq(pageLayouts)
  components = _.uniqBy(components, c => c.componentChunkName)

  // Create file with sync requires of layouts/components/json files.
  let syncRequires = `// prefer default export if available
const preferDefault = m => m && m.default || m
\n\n`
  syncRequires += `exports.layouts = {\n${pageLayouts
    .map(
      l =>
        `  "${l.machineId}": preferDefault(require("${
          l.componentWrapperPath
        }"))`
    )
    .join(`,\n`)}
}\n\n`
  syncRequires += `exports.components = {\n${components
    .map(
      c =>
        `  "${c.componentChunkName}": preferDefault(require("${joinPath(
          c.component
        )}"))`
    )
    .join(`,\n`)}
}\n\n`

  // Create file with async requires of layouts/components/json files.
  let asyncRequires = `// prefer default export if available
const preferDefault = m => m && m.default || m
\n`
  asyncRequires += `exports.components = {\n${components
    .map(
      c =>
        `  "${c.componentChunkName}": () => import("${joinPath(
          c.component
        )}" /* webpackChunkName: "${c.componentChunkName}" */)`
    )
    .join(`,\n`)}
}\n\n`

  const staticDataPaths = JSON.stringify(jsonDataPaths)

  asyncRequires += `exports.json = ${staticDataPaths}\n\n`

  asyncRequires += `exports.layouts = {\n${pageLayouts
    .map(
      l =>
        `  "${l.machineId}": () => import("${
          l.componentWrapperPath
        }" /* webpackChunkName: "${l.componentChunkName}" */)`
    )
    .join(`,\n`)}
}`

  const writeAndMove = (file, data) => {
    const destination = joinPath(program.directory, `.cache`, file)
    const tmp = `${destination}.${Date.now()}`
    return fs
      .writeFile(tmp, data)
      .then(() => fs.move(tmp, destination, { overwrite: true }))
  }

  return await Promise.all([
    writeAndMove(`pages.json`, JSON.stringify(pagesData, null, 4)),
    writeAndMove(`sync-requires.js`, syncRequires),
    writeAndMove(`async-requires.js`, asyncRequires),
    writeAndMove(`static-data-paths.json`, staticDataPaths),
  ])
}

exports.writePages = writePages

let bootstrapFinished = false
let oldPages
const debouncedWritePages = _.debounce(
  () => {
    // Don't write pages again until bootstrap has finished.
    if (bootstrapFinished && !_.isEqual(oldPages, store.getState().pages)) {
      writePages()
      oldPages = store.getState().pages
    }
  },
  500,
  { leading: true }
)
emitter.on(`CREATE_PAGE`, () => {
  // Ignore CREATE_PAGE until bootstrap is finished
  // as this is called many many times during bootstrap and
  // we can ignore them until CREATE_PAGE_END is called.
  //
  // After bootstrap, we need to listen for this as stateful page
  // creators e.g. the internal plugin "component-page-creator"
  // calls createPage directly so CREATE_PAGE_END won't get fired.
  if (bootstrapFinished) {
    debouncedWritePages()
  }
})

emitter.on(`CREATE_PAGE_END`, () => {
  debouncedWritePages()
})
emitter.on(`DELETE_PAGE`, () => {
  debouncedWritePages()
})
emitter.on(`DELETE_PAGE_BY_PATH`, () => {
  debouncedWritePages()
})

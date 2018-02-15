const globCB = require(`glob`)
const Promise = require(`bluebird`)
const _ = require(`lodash`)
const chokidar = require(`chokidar`)
const systemPath = require(`path`)

const glob = Promise.promisify(globCB)

const validatePath = require(`./validate-path`)

// Path creator.
// Auto-create layouts.
// algorithm is glob /layouts directory for js/jsx/cjsx files *not*
// underscored
exports.createLayouts = async ({ store, actions }, options, doneCb) => {
  const { createLayout, deleteLayout } = actions
  const program = store.getState().program
  const exts = program.extensions.map(e => `${e.slice(1)}`).join(`,`)
  const layoutDirectory = systemPath.posix.join(
    program.directory,
    `/src/layouts`
  )
  const layoutGlob = `${layoutDirectory}/**/*.{${exts}}`

  // Get initial list of files.
  let files = await glob(layoutGlob)
  files.forEach(file => _createLayout(file, layoutDirectory, createLayout))

  // Listen for new layouts to be added or removed.
  chokidar
    .watch(layoutGlob)
    .on(`add`, path => {
      if (!_.includes(files, path)) {
        _createLayout(path, layoutDirectory, createLayout)
        files.push(path)
      }
    })
    .on(`unlink`, path => {
      // Delete the layout for the now deleted component.
      store
        .getState()
        .layouts.filter(p => p.component === path)
        .forEach(layout => {
          deleteLayout({ name: layout.name })
          files = files.filter(f => f !== layout.name)
        })
    })
    .on(`ready`, () => doneCb())
}
const _createLayout = (filePath, layoutDirectory, createLayout) => {
  // Filter out special components that shouldn't be made into
  // layouts.
  if (!validatePath(systemPath.posix.relative(layoutDirectory, filePath))) {
    return
  }

  // Create layout object
  const layout = {
    component: filePath,
  }

  // Add layout
  createLayout(layout)
}

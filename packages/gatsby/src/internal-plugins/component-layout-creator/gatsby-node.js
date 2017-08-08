const globCB = require(`glob`)
const Promise = require(`bluebird`)
const _ = require(`lodash`)
const chokidar = require(`chokidar`)
const systemPath = require(`path`)

const glob = Promise.promisify(globCB)

const createPath = require(`./create-path`)
const validatePath = require(`./validate-path`)

// Path creator.
// Auto-create layouts.
// algorithm is glob /layouts directory for js/jsx/cjsx files *not*
// underscored. Then create url w/ our path algorithm *unless* user
// takes control of that page component in gatsby-node.
exports.createLayouts = async (
  { store, boundActionCreators },
  options,
  doneCb
) => {
  const { createLayout, deleteLayout } = boundActionCreators
  const program = store.getState().program
  const layoutDirectory = systemPath.posix.join(
    program.directory,
    `/src/layouts`
  )
  const exts = program.extensions.map(e => `${e.slice(1)}`).join(`,`)

  // Get initial list of files.
  let files = await glob(`${layoutDirectory}/**/?(${exts})`)
  files.forEach(file => _createLayout(file, layoutDirectory, createLayout))

  // Listen for new layouts to be added or removed.
  chokidar
    .watch(`${layoutDirectory}/**/*.{${exts}}`)
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
          files = files.filter(f => f !== name)
        })
    })
    .on(`ready`, () => doneCb())
}
const _createLayout = (filePath, layoutDirectory, createLayout) => {
  // Filter out special components that shouldn't be made into
  // pages.
  if (!validatePath(systemPath.posix.relative(layoutDirectory, filePath))) {
    return
  }

  // Create page object
  const layout = {
    component: filePath,
  }

  // Add page
  createLayout(layout)
}

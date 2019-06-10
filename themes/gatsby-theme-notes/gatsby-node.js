const fs = require(`fs`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)
const crypto = require(`crypto`)
const Debug = require(`debug`)

const debug = Debug(`gatsby-theme-notes`)

const Note = require.resolve(`./src/templates/note`)
const Notes = require.resolve(`./src/templates/notes`)

exports.createPages = async ({ graphql, actions }, pluginOptions) => {
  const { createPage } = actions

  const { notesPath = `/notes` } = pluginOptions

  const toNotesPath = node => {
    const { dir } = path.parse(node.parent.relativePath)
    return path.join(notesPath, dir, node.parent.name)
  }

  const result = await graphql(`
    {
      mdxPages: allMdx {
        edges {
          node {
            id
            parent {
              ... on File {
                name
                base
                relativePath
                sourceInstanceName
              }
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    console.log(result.errors)
    throw new Error(`Could not query notes`, result.errors)
  }

  const { mdxPages } = result.data
  const notes = mdxPages.edges.filter(
    ({ node }) => node.parent.sourceInstanceName === `notes`
  )

  // Create notes pages
  notes.forEach(({ node }) => {
    createPage({
      path: toNotesPath(node),
      context: {
        ...node,
        title: node.parent.name,
      },
      component: Note,
    })
  })

  const notesUrls = notes.map(({ node }) => toNotesPath(node))

  const groupedNotes = notes.reduce((acc, { node }) => {
    const { dir } = path.parse(node.parent.relativePath)

    if (!dir) {
      return acc
    }

    acc[dir] = acc[dir] || []
    acc[dir].push({
      pagePath: path.join(notesPath, dir),
      url: toNotesPath(node),
      ...node,
    })

    return acc
  }, {})

  Object.entries(groupedNotes).map(([key, value]) => {
    const breadcrumbs = key.split(path.sep).reduce(
      (acc, dir) => [
        ...acc,
        {
          name: dir,
          url: path.join(notesPath, dir),
        },
      ],
      []
    )

    createPage({
      path: path.join(notesPath, key),
      context: {
        breadcrumbs,
        urls: value.map(v => v.url),
      },
      component: Notes,
    })
  })

  createPage({
    path: notesPath,
    context: {
      urls: notesUrls,
      groupedNotes,
    },
    component: Notes,
  })
}

exports.onPreBootstrap = ({ store }, opts) => {
  const { program } = store.getState()

  const dirs = [path.join(program.directory, opts.notes || `notes`)]

  dirs.forEach(dir => {
    debug(`Initializing ${dir} directory`)
    if (!fs.existsSync(dir)) {
      mkdirp.sync(dir)
    }
  })
}

exports.sourceNodes = (
  { actions: { createTypes, createNode }, schema },
  { notesPath = `/notes`, homeText = `~`, breadcrumbSeparator = `/` }
) => {
  // Create the Garden type to solidify the field data types
  createTypes(`type NotesConfig implements Node {
notesPath: String!
home: String
breadcrumbSeparator: String
}`)

  // create garden data from plugin config
  const notesConfig = {
    breadcrumbSeparator,
    notesPath,
    homeText,
  }

  createNode({
    ...notesConfig,
    id: `gatsby-theme-notes-config`,
    parent: null,
    children: [],
    internal: {
      type: `NotesConfig`,
      contentDigest: crypto
        .createHash(`md5`)
        .update(JSON.stringify(notesConfig))
        .digest(`hex`),
      content: JSON.stringify(notesConfig),
      description: `Notes Config`,
    },
  })
}

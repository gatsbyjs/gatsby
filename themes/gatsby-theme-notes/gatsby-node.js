const fs = require(`fs`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)
const crypto = require(`crypto`)
const Debug = require(`debug`)
const { urlResolve } = require(`gatsby-core-utils`)

const debug = Debug(`gatsby-theme-notes`)

// These are customizable theme options we only need to check once
let basePath
let contentPath

// These templates are simply data-fetching wrappers that import components
const NoteTemplate = require.resolve(`./src/templates/note`)
const NotesTemplate = require.resolve(`./src/templates/notes`)

exports.onPreBootstrap = ({ store }, themeOptions) => {
  const { program } = store.getState()

  basePath = themeOptions.basePath || `/`
  contentPath = themeOptions.contentPath || `content/notes`

  const dirs = [path.join(program.directory, contentPath)]

  dirs.forEach(dir => {
    debug(`Initializing ${dir} directory`)
    if (!fs.existsSync(dir)) {
      mkdirp.sync(dir)
    }
  })
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const toNotesPath = node => {
    const { dir } = path.parse(node.parent.relativePath)
    return urlResolve(basePath, dir, node.parent.name)
  }

  const result = await graphql(`
    {
      site {
        siteMetadata {
          title
        }
      }
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

  const { mdxPages, site } = result.data
  const siteTitle = site.siteMetadata.title
  const notes = mdxPages.edges.filter(
    ({ node }) => node.parent.sourceInstanceName === contentPath
  )

  // Create notes pages
  notes.forEach(({ node }) => {
    createPage({
      path: toNotesPath(node),
      context: {
        ...node,
        title: node.parent.name,
      },
      component: NoteTemplate,
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
      pagePath: path.join(basePath, dir),
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
          url: path.join(basePath, dir),
        },
      ],
      []
    )

    createPage({
      path: path.join(basePath, key),
      context: {
        breadcrumbs,
        siteTitle,
        urls: value.map(v => v.url),
      },
      component: NotesTemplate,
    })
  })

  createPage({
    path: basePath,
    context: {
      urls: notesUrls,
      groupedNotes,
      siteTitle,
    },
    component: NotesTemplate,
  })
}

exports.sourceNodes = (
  { actions: { createTypes, createNode }, schema },
  { basePath = `/`, homeText = `~`, breadcrumbSeparator = `/` }
) => {
  // Create the Garden type to solidify the field data types
  createTypes(`type NotesConfig implements Node {
basePath: String!
home: String
breadcrumbSeparator: String
}`)

  // create garden data from plugin config
  const notesConfig = {
    breadcrumbSeparator,
    basePath,
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

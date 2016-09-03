import chokidar from 'chokidar'
const babylon = require('babylon')
import fs from 'fs'
import _ from 'lodash'
const babel = require('babel-core')
import path from 'path'
import schemaPromise from './schema'
import { graphql } from 'graphql'

// Paths
const paths = new Map()
const pathGenerationFinished = new Promise((resolve, reject) => {
  schemaPromise.then((schema) => {
    const blogPost = '/Users/kylemathews/programs/blog/pages/blog-post.js'
    const tagPages = '/Users/kylemathews/programs/blog/pages/tag-page.js'
    graphql(schema, `
      {
        allMarkdown(first: 1000) {
          edges {
            node {
              path
              frontmatter {
                tags
              }
            }
          }
        }
      }
    `)
    .then(result => {
      if (result.errors) { console.log(result.errors) }

      // Blog posts.
      const blogPostPaths = result.data.allMarkdown.edges.map((edge) => ({
        ...edge.node
      }))
      paths.set(blogPost, blogPostPaths)

      // Tag pages.
      let tags = []
      _.each(result.data.allMarkdown.edges, (edge) => {
        if (edge.node.frontmatter.tags) {
          tags = tags.concat(edge.node.frontmatter.tags.map((tag) => tag.toLowerCase()))
        }
      })
      tags = _.uniq(tags)
      const tagPagePaths = tags.map((tag) => ({
        path: `/tags/${_.kebabCase(tag)}/`,
        tag,
      }))
      paths.set(tagPages, tagPagePaths)

      // Add individual pages.
      const tagsPages = '/Users/kylemathews/programs/blog/pages/tags-page.js'
      const indexPage = '/Users/kylemathews/programs/blog/pages/index.js'
      paths.set(tagsPages, [{ path: '/tags/' }])
      paths.set(indexPage, [{ path: '/' }])
      resolve()
    })
  })
})

// Queue for processing files
const q = queue((file, callback) => {
  console.log('route component queued for processing', file)
  const fileStr = fs.readFileSync(file, 'utf-8')
  const ast = babylon.parse(fileStr, {
    sourceType: 'module',
    sourceFilename: true,
    plugins: [
      'asyncFunctions',
      'jsx',
      'flow',
      'objectRestSpread',
    ],
  })
  const absFile = path.resolve(file)
  let pathsInfo = {}
  pathsInfo = {
    componentPath: absFile,
    paths: paths.get(absFile)
  }

  babel.transformFromAst(ast, "", {
    plugins: [[require(`${__dirname}/query-runner`), { ...pathsInfo }]],
  })

  // Write out routes file.
  // Loop through all paths and write them out to child-routes.js
  let childRoutes = ""
  let splitChildRoutes = ""
  paths.forEach((pathInfos) => {
    _.each(pathInfos, (pathInfo) => {
      let fileName = _.kebabCase(pathInfo.path)
      if (fileName === ".js") {
        fileName = "index.js"
      }
      childRoutes += `
			{
        path:'${pathInfo.path}',
				getComponent(nextState, cb) {
          cb(null, require('./route-hocs/${fileName}'))
				}
			},
      `
      splitChildRoutes += `
			{
        path:'${pathInfo.path}',
				getComponent(nextState, cb) {
          require.ensure([], (require) => {
            cb(null, require('./route-hocs/${fileName}'))
          })
				}
			},
      `
    })
  })
  childRoutes = `const childRoutes = [${childRoutes}]; module.exports = childRoutes`
  splitChildRoutes = `const childRoutes = [${splitChildRoutes}]; module.exports = childRoutes`
  fs.writeFileSync('/Users/kylemathews/programs/blog/.gatsby-intermediate-build/child-routes.js', childRoutes)
  fs.writeFileSync('/Users/kylemathews/programs/blog/.gatsby-intermediate-build/split-child-routes.js', splitChildRoutes)
  console.log('wrote child-routes files')
  //const fileName = `${_.kebabCase(pathInfo.path)}.js`
  callback()
}, 2)

pathGenerationFinished.then(() => {
  var watcher = chokidar.watch('/Users/kylemathews/programs/blog/pages/*.js', {
    ignored: /[\/\\]\./,
    persistent: true
  })

  watcher
  .on('add', path => q.push(path))
  .on('change', path => q.push(path))
  .on('unlink', path => q.push(path))
})

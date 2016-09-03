import { graphql } from 'graphql'
import Promise from 'bluebird'
import queryRunner from './query-runner'
import { routesDB } from './globals'
import path from 'path'
import glob from 'glob'
import _ from 'lodash'
import createPath from './createPath'
import mkdirp from 'mkdirp'

Promise.onPossiblyUnhandledRejection(function(error){
  throw error;
});
process.on('unhandledRejection', function(error, promise) {
  console.error("UNHANDLED REJECTION", error.stack);
});

// Path creator.
// Auto-create routes.
// algorithm is glob /pages directory for js/jsx/cjsx files *not*
// underscored. Then create url w/ our path algorithm *unless* user
// takes control of that route component in gatsby-node.
const autoPathCreator = (program, routes, cb) => {
  const pagesDirectory = path.join(program.directory, 'pages')
  let routeObjects = []
  glob(`${pagesDirectory}/**/?(*.js|*.jsx|*.cjsx)`, (err, files) => {
    // Remove route components that the user or a plugin has already
    // created paths for.
    const standalonePaths = _.filter(files, (filePath) => {
      return !_.some(routes, (route) => route.component === filePath)
    })

    // Create initial route objects.
    routeObjects = standalonePaths.map((filePath) => ({
      component: filePath,
      path: filePath,
    }))

    // Convert path to one relative to the pages directory.
    routeObjects.forEach((route) => {
      route.path = path.relative(pagesDirectory, route.path)
      return route
    })

    // Remove routes starting with an underscore.
    routeObjects = _.filter(routeObjects, (route) => {
      return route.path.slice(0, 1) !== '_'
    })

    // Convert to our path format.
    routeObjects = routeObjects.map((route) => {
      route.path = createPath(pagesDirectory, route.component)
      return route
    })
    console.log(routeObjects)

    cb(null, routeObjects)
  })
}


module.exports = (program, cb) => {
  const config = require(`${program.directory}/gatsby.config`)
  const gatsbyNode = require(`${program.directory}/gatsby-node`)

  // Ensure .gatsby-intermediate-build/json directory exists.
  mkdirp.sync(`${program.directory}/.gatsby-intermediate-build/json`)

  require('./schema')(program.directory).then((schema) => {
    const graphqlRunner = (query, context) => graphql(schema, query, context)
    // Start query runner.
    // Assemble routes. TODO auto-find individual js components that
    // don't aren't a multi-page route component thingy.
    new Promise((resolve, reject) => {
      if (gatsbyNode.createRoutes) {
        gatsbyNode.createRoutes(graphqlRunner, (err, routes) => {
          err ? reject(err) : resolve(routes)
        })
      } else {
        resolve([])
      }
    })
    .then((routes) => {
      routesDB.insert(routes)
      autoPathCreator(program, routes, (err, autoRoutes) => {
        routesDB.insert(autoRoutes)
        //console.log(routesDB.data)

        // TODO how to add routes to the graphql schema
        //console.log('routes', routes)

        queryRunner(routesDB.data, program.directory, graphqlRunner)
        cb(null, routesDB.data, schema)
      })
    })
  })
}

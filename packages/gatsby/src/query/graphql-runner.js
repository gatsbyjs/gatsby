const { graphql } = require(`graphql`)
const tracer = require(`opentracing`).globalTracer()

const withResolverContext = require(`../schema/context`)
const { LocalNodeModel } = require(`../schema/node-model`)
const { tracingResolver } = require(`../schema/resolvers`)

class GraphQLRunner {
  constructor(store) {
    this.store = store
    const nodeStore = require(`../db/nodes`)
    const createPageDependency = require(`../redux/actions/add-page-dependency`)
    const { schema, schemaCustomization } = this.store.getState()

    this.nodeModel = new LocalNodeModel({
      nodeStore,
      schema,
      schemaComposer: schemaCustomization.composer,
      createPageDependency,
    })
  }

  async query(query, context, { parentSpan } = {}) {
    const { schema, schemaCustomization } = this.store.getState()

    const activity = new SpanTracker(`GraphQL Query`, {
      parentSpan: parentSpan,
      tags: {
        queryName: query.name,
      },
    })

    activity.start()
    const result = await graphql({
      schema,
      source: query.text,
      rootValue: context,
      contextValue: withResolverContext({
        schema,
        schemaComposer: schemaCustomization.composer,
        context: {
          ...context,
          spanTracker: activity,
        },
        customContext: schemaCustomization.context,
        nodeModel: this.nodeModel,
      }),
      variableValues: context,
      fieldResolver: tracingResolver(),
    })
    activity.done()
    return result
  }
}

class SpanTracker {
  constructor(name, { parentSpan, ...args }) {
    this.parentSpan = tracer.startSpan(name, {
      childOf: parentSpan,
      ...args,
    })
    this.spans = {}
  }

  start() {}

  done() {
    this.parentSpan.finish()
  }

  createActivity(path, name, args) {
    let prev = path.prev
    if (prev && Number.isInteger(prev.key)) {
      prev = prev.prev
    }
    const parentSpan = this.getSpan(prev)
    const span = tracer.startSpan(name, { childOf: parentSpan, ...args })
    this.setSpan(path, span)
    return {
      span,

      start() {},

      done() {
        span.finish()
      },
    }
  }

  getSpan(gqlPath) {
    const path = pathToArray(gqlPath)
    if (path.length > 0) {
      return this.spans[path.join(`.`)]
    } else {
      return this.parentSpan
    }
  }

  setSpan(gqlPath, span) {
    const path = pathToArray(gqlPath)
    this.spans[path.join(`.`)] = span
  }
}

module.exports = GraphQLRunner

const pathToArray = path => {
  const flattened = []
  let curr = path
  while (curr) {
    flattened.push(curr.key)
    curr = curr.prev
  }
  return flattened.reverse()
}

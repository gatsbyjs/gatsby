import { createSchemaCustomization } from "../gatsby-node"
import { mockGatsbyApi } from "../__fixtures__/test-utils"
import { globalTracer } from "opentracing"

const {
  getNode,
  getNodesByType,
  reporter,
  cache,
  pathPrefix,
  actions,
  schema,
  createContentDigest,
  loadNodeContent,
  store,
  emitter,
  getNodes,
  getNodeAndSavePathDependency,
  getCache,
  createNodeId,
  tracing,
} = mockGatsbyApi()

actions.createTypes = jest.fn()

describe(`Gatsby Node API`, () => {
  it(`createSchemaCustomization`, async () => {
    if (!createSchemaCustomization) {
      throw new Error(`createSchemaCustomization shoudl exist`)
    }
    await createSchemaCustomization(
      {
        getNode,
        getNodesByType,
        pathPrefix,
        reporter,
        cache,
        actions,
        schema,
        traceId: `initial-createSchemaCustomization`,
        parentSpan: globalTracer().startSpan(`test`),
        basePath: ``,
        createContentDigest,
        loadNodeContent,
        store,
        emitter,
        getNodes,
        getNodeAndSavePathDependency,
        getCache,
        createNodeId,
        tracing,
      },
      { plugins: [] },
      () => {}
    )
    expect(actions.createTypes).toHaveBeenCalledTimes(1)

    const buildObjectTypeCalls = (schema.buildObjectType as jest.Mock).mock
      .calls

    expect(buildObjectTypeCalls[0][0].extensions.infer).toBe(true)
    expect(Object.keys(buildObjectTypeCalls[0][0].fields)).toMatchObject([
      `excerpt`,
      `tableOfContents`,
    ])

    expect(buildObjectTypeCalls[0][0].fields.excerpt.type).toBe(`String`)
    expect(buildObjectTypeCalls[0][0].fields.tableOfContents.type).toBe(`JSON`)
  })
})

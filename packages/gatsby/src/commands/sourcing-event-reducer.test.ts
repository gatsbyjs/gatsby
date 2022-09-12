import reduce from "./sourcing-event-reducer.ts"
import { ISourcingEvent, ISourcingStartStopEvent } from "./reduce-types"

describe(`reduces sourcings`, () => {
  it(`handles SOURCING_STARTED`, () => {
    const event: ISourcingStartStopEvent = {
      type: `SOURCING_STARTED`,
      traceId: `1`,
      timestamp: 0,
    }
    expect(reduce(event)).toMatchInlineSnapshot(`
      Map {
        "1" => Object {
          "deletedNodeCount": 0,
          "events": Array [
            Object {
              "timestamp": 0,
              "traceId": "1",
              "type": "SOURCING_STARTED",
            },
          ],
          "newNodeCount": 0,
          "startTime": 0,
          "traceId": "1",
          "updatedNodeCount": 0,
        },
      }
    `)
  })
  it(`handles CREATE_NODE with new node`, () => {
    const event = {
      type: `CREATE_NODE`,
      traceId: `1`,
      payload: {
        id: `1`,
      },
    }
    expect(reduce(event)).toMatchInlineSnapshot(`
      Map {
        "1" => Object {
          "deletedNodeCount": 0,
          "events": Array [
            Object {
              "timestamp": 0,
              "traceId": "1",
              "type": "SOURCING_STARTED",
            },
            Object {
              "payload": Object {
                "id": "1",
              },
              "traceId": "1",
              "type": "CREATE_NODE",
            },
          ],
          "newNodeCount": 1,
          "startTime": 0,
          "traceId": "1",
          "updatedNodeCount": 0,
        },
      }
    `)
  })
  it(`handles SOURCING_ENDED`, () => {
    const event: ISourcingStartStopEvent = {
      type: `SOURCING_ENDED`,
      traceId: `1`,
      timestamp: 500,
    }
    expect(reduce(event)).toMatchInlineSnapshot(`
      Map {
        "1" => Object {
          "deletedNodeCount": 0,
          "durationMs": 500,
          "endTime": 500,
          "events": Array [
            Object {
              "timestamp": 0,
              "traceId": "1",
              "type": "SOURCING_STARTED",
            },
            Object {
              "payload": Object {
                "id": "1",
              },
              "traceId": "1",
              "type": "CREATE_NODE",
            },
            Object {
              "timestamp": 500,
              "traceId": "1",
              "type": "SOURCING_ENDED",
            },
          ],
          "newNodeCount": 1,
          "startTime": 0,
          "traceId": "1",
          "updatedNodeCount": 0,
        },
      }
    `)
  })
  it(`handles CREATE_NODE with updated node`, () => {
    const sourcingStartEvent: ISourcingStartStopEvent = {
      type: `SOURCING_STARTED`,
      traceId: `2`,
      timestamp: 1000,
    }
    reduce(sourcingStartEvent)

    const nodeEvent = {
      type: `CREATE_NODE`,
      traceId: `2`,
      oldNode: {
        id: `1`,
      },
      payload: {
        id: `1`,
        something: true,
      },
    }
    const sourcings = reduce(nodeEvent)
    expect(sourcings.get(`2`).updatedNodeCount).toBe(1)
    expect(sourcings).toMatchInlineSnapshot(`
      Map {
        "1" => Object {
          "deletedNodeCount": 0,
          "durationMs": 500,
          "endTime": 500,
          "events": Array [
            Object {
              "timestamp": 0,
              "traceId": "1",
              "type": "SOURCING_STARTED",
            },
            Object {
              "payload": Object {
                "id": "1",
              },
              "traceId": "1",
              "type": "CREATE_NODE",
            },
            Object {
              "timestamp": 500,
              "traceId": "1",
              "type": "SOURCING_ENDED",
            },
          ],
          "newNodeCount": 1,
          "startTime": 0,
          "traceId": "1",
          "updatedNodeCount": 0,
        },
        "2" => Object {
          "deletedNodeCount": 0,
          "events": Array [
            Object {
              "timestamp": 1000,
              "traceId": "2",
              "type": "SOURCING_STARTED",
            },
            Object {
              "oldNode": Object {
                "id": "1",
              },
              "payload": Object {
                "id": "1",
                "something": true,
              },
              "traceId": "2",
              "type": "CREATE_NODE",
            },
          ],
          "newNodeCount": 0,
          "startTime": 1000,
          "traceId": "2",
          "updatedNodeCount": 1,
        },
      }
    `)
  })
  it(`handles DELETE_NODE`, () => {
    const nodeEvent = {
      type: `DELETE_NODE`,
      payload: {
        id: `1`,
        something: true,
      },
    }
    const sourcings = reduce(nodeEvent)
    expect(sourcings.get(`2`).deletedNodeCount).toBe(1)
    expect(sourcings).toMatchInlineSnapshot(`
      Map {
        "1" => Object {
          "deletedNodeCount": 0,
          "durationMs": 500,
          "endTime": 500,
          "events": Array [
            Object {
              "timestamp": 0,
              "traceId": "1",
              "type": "SOURCING_STARTED",
            },
            Object {
              "payload": Object {
                "id": "1",
              },
              "traceId": "1",
              "type": "CREATE_NODE",
            },
            Object {
              "timestamp": 500,
              "traceId": "1",
              "type": "SOURCING_ENDED",
            },
          ],
          "newNodeCount": 1,
          "startTime": 0,
          "traceId": "1",
          "updatedNodeCount": 0,
        },
        "2" => Object {
          "deletedNodeCount": 1,
          "events": Array [
            Object {
              "timestamp": 1000,
              "traceId": "2",
              "type": "SOURCING_STARTED",
            },
            Object {
              "oldNode": Object {
                "id": "1",
              },
              "payload": Object {
                "id": "1",
                "something": true,
              },
              "traceId": "2",
              "type": "CREATE_NODE",
            },
            Object {
              "payload": Object {
                "id": "1",
                "something": true,
              },
              "type": "DELETE_NODE",
            },
          ],
          "newNodeCount": 0,
          "startTime": 1000,
          "traceId": "2",
          "updatedNodeCount": 1,
        },
      }
    `)
  })
})

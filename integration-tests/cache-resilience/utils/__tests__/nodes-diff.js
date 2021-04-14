const { compareState } = require(`../nodes-diff`)

describe(`compareState`, () => {
  it(`computes additions`, () => {
    const mapA = new Map(),
      mapB = new Map()
    mapA.set(`1`, { id: `1`, value: `a` })
    mapB.set(`1`, { id: `1`, value: `a` })
    mapB.set(`2`, { id: `2`, value: `b` })
    expect(compareState(mapA, mapB)).toMatchInlineSnapshot(`
      Object {
        "additions": Object {
          "2": Object {
            "id": "2",
            "value": "b",
          },
        },
        "changes": Object {},
        "deletions": Object {},
        "dirtyIds": Array [
          "2",
        ],
      }
    `)
  })
  it(`computes deletions`, () => {
    const mapA = new Map(),
      mapB = new Map()
    mapA.set(`1`, { id: `1`, value: `a` })
    mapA.set(`2`, { id: `2`, value: `b` })
    mapB.set(`1`, { id: `1`, value: `a` })
    expect(compareState(mapA, mapB)).toMatchInlineSnapshot(`
      Object {
        "additions": Object {},
        "changes": Object {},
        "deletions": Object {
          "2": Object {
            "id": "2",
            "value": "b",
          },
        },
        "dirtyIds": Array [
          "2",
        ],
      }
    `)
  })
  it(`computes changes`, () => {
    const mapA = new Map(),
      mapB = new Map()
    mapA.set(`1`, { id: `1`, value: `a` })
    mapA.set(`2`, { id: `2`, value: `b` })
    mapA.set(`3`, { id: `3`, value: `c` })

    mapB.set(`1`, { id: `1`, value: `a` })
    mapB.set(`2`, { id: `2`, value: `y` })
    mapB.set(`3`, { id: `3`, value: `z` })
    expect(compareState(mapA, mapB)).toMatchInlineSnapshot(`
      Object {
        "additions": Object {},
        "changes": Object {
          "2": Object {
            "diff": "  Object {
          \\"id\\": \\"2\\",
      -   \\"value\\": \\"b\\",
      +   \\"value\\": \\"y\\",
        }",
            "id": "2",
            "newValue": Object {
              "id": "2",
              "value": "y",
            },
            "oldValue": Object {
              "id": "2",
              "value": "b",
            },
          },
          "3": Object {
            "diff": "  Object {
          \\"id\\": \\"3\\",
      -   \\"value\\": \\"c\\",
      +   \\"value\\": \\"z\\",
        }",
            "id": "3",
            "newValue": Object {
              "id": "3",
              "value": "z",
            },
            "oldValue": Object {
              "id": "3",
              "value": "c",
            },
          },
        },
        "deletions": Object {},
        "dirtyIds": Array [
          "2",
          "3",
        ],
      }
    `)
  })
})

const _ = require(`lodash`)

const reduceArrayToObject = array =>
  array.reduce((accumulator, currentValue) => {
    accumulator[currentValue.id] = currentValue
    return accumulator
  }, {})

const compareState = (oldState, newState) => {
  let additions = _.differenceWith(
    Array.from(newState.values()),
    Array.from(oldState.values()),
    _.isEqual
  )

  let deletions = _.differenceWith(
    Array.from(oldState.values()),
    Array.from(newState.values()),
    _.isEqual
  )

  const changes = _.intersectionWith(
    additions,
    deletions,
    (left, right) => left.id === right.id
  ).map(({ id }) => {
    return {
      id,
      oldValue: oldState.get(id),
      newValue: newState.get(id),
    }
  })

  changes.forEach(({ id }) => {
    additions = additions.filter(addition => addition.id !== id)
    deletions = deletions.filter(deletion => deletion.id !== id)
  })

  console.log(changes)
  return {
    additions: reduceArrayToObject(additions),
    deletions: reduceArrayToObject(deletions),
    changes: reduceArrayToObject(changes),
  }
}

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
      }
    `)
  })
})

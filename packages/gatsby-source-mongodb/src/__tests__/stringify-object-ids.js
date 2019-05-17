const stringifyObjectIds = require(`../stringify-object-ids`)
const ObjectID = require(`mongodb`).ObjectID

test(`ObjectIDs are not Equal to hexStrings with the same value`, () => {
  const objectId = new ObjectID()
  expect(objectId).not.toEqual(objectId.toHexString())
})

test(`it returns stringified object id when passed one`, () => {
  const objectId = new ObjectID()
  expect(stringifyObjectIds(objectId)).toEqual(objectId.toHexString())
  expect(stringifyObjectIds(objectId)).not.toEqual(objectId)
})

test(`when passed an array of ObjectIDs it returns an array of strings`, () => {
  const ids = [
    new ObjectID().toHexString(),
    new ObjectID().toHexString(),
    new ObjectID().toHexString(),
  ]
  const arrOfObjectIds = ids.map(id => new ObjectID(id))
  expect(stringifyObjectIds(arrOfObjectIds)).toEqual(ids)
  expect(stringifyObjectIds(arrOfObjectIds)).not.toEqual(arrOfObjectIds)
})

test(`when passed an array of object literals with ObjectIDs it returns an array of object literals with strings`, () => {
  const ids = [
    new ObjectID().toHexString(),
    new ObjectID().toHexString(),
    new ObjectID().toHexString(),
  ]

  const arrayOfObjects = ids.map((id, ind) => {
    return {
      key: ind,
      value: new ObjectID(id),
    }
  }, [])

  const expectedResult = ids.map((id, ind) => {
    return {
      key: ind,
      value: id,
    }
  }, [])

  expect(stringifyObjectIds(arrayOfObjects)).toEqual(expectedResult)
  expect(stringifyObjectIds(arrayOfObjects)).not.toEqual(arrayOfObjects)
})

test(`when passed a deeply nested, complex object literal, it returns all stringified ObjectIds within a nested, complex object literal`, () => {
  const ids = [
    new ObjectID().toHexString(),
    new ObjectID().toHexString(),
    new ObjectID().toHexString(),
    new ObjectID().toHexString(),
    new ObjectID().toHexString(),
    new ObjectID().toHexString(),
  ]
  const complexNested = {
    id: new ObjectID(ids[0]),
    connections: [
      {
        id: new ObjectID(ids[1]),
      },
      {
        ids: [new ObjectID(ids[2]), new ObjectID(ids[3])],
      },
    ],
    name: {
      first: `sally`,
      last: {
        maiden: {
          val: `smith`,
          id: new ObjectID(ids[4]),
        },
        current: {
          val: `wilson`,
          id: new ObjectID(ids[5]),
        },
        former: {
          val: `smith`,
          id: new ObjectID(ids[4]),
        },
      },
    },
  }
  const expectedResult = {
    id: ids[0],
    connections: [
      {
        id: ids[1],
      },
      {
        ids: [ids[2], ids[3]],
      },
    ],
    name: {
      first: `sally`,
      last: {
        maiden: {
          val: `smith`,
          id: ids[4],
        },
        current: {
          val: `wilson`,
          id: ids[5],
        },
        former: {
          val: `smith`,
          id: ids[4],
        },
      },
    },
  }

  expect(stringifyObjectIds(complexNested)).toEqual(expectedResult)
  expect(stringifyObjectIds(complexNested)).not.toEqual(complexNested)
})

const stringifyObjectIds = require(`../stringify-object-ids`)
const ObjectID = require(`mongodb`).ObjectID

test(`it is a function`, () => {
  expect(stringifyObjectIds).toEqual(expect.any(Function))
})

test(`ObjectIDs are instances of mongodb.ObjectID and not strings`, () => {
  const objectId = new ObjectID(`5c6d85cff2bc0b7a5da61124`)
  expect(objectId instanceof ObjectID).toBeTruthy()
  expect(typeof objectId == `string`).toBeFalsy()
})

test(`ObjectIDs are not Equal to Strings with the same value`, () => {
  const objectId = new ObjectID(`5c6d85cff2bc0b7a5da61124`)
  const str = `5c6d85cff2bc0b7a5da61124`
  expect(objectId).not.toEqual(str)
  expect(objectId)
})

test(`it returns stringified object id when passed one`, () => {
  const objectId = new ObjectID(`5c6d85cff2bc0b7a5da61124`)
  expect(stringifyObjectIds(objectId)).toEqual(`5c6d85cff2bc0b7a5da61124`)
})

test(`when passed an array of ObjectIDs it returns an array of strings`, () => {
  const str1 = `5c6d85cff2bc0b7a5da61124`,
    str2 = `5c6d85fdf2bc0b7a5da6112a`,
    str3 = `5c6d863df2bc0b7a5da61132`,
    obj1 = new ObjectID(str1),
    obj2 = new ObjectID(str2),
    obj3 = new ObjectID(str3),
    arr = [obj1, obj2, obj3],
    res = [str1, str2, str3],
    stringifiedArr = stringifyObjectIds(arr)

  expect(stringifiedArr[0]).toEqual(res[0])
  expect(stringifiedArr[1]).toEqual(res[1])
  expect(stringifiedArr[2]).toEqual(res[2])
})

test(`when passed an array of object literals with ObjectIDs it returns an array of object literals with strings`, () => {
  const str1 = `5c6d85cff2bc0b7a5da61124`,
    str2 = `5c6d85fdf2bc0b7a5da6112a`,
    str3 = `5c6d863df2bc0b7a5da61132`,
    obj1 = new ObjectID(str1),
    obj2 = new ObjectID(str2),
    obj3 = new ObjectID(str3),
    obj = [
      {
        key: `one`,
        id: obj1,
      },
      {
        key: `two`,
        id: obj2,
      },
      {
        key: `three`,
        id: obj3,
      },
    ],
    res = [
      {
        key: `one`,
        id: str1,
      },
      {
        key: `two`,
        id: str2,
      },
      {
        key: `three`,
        id: str3,
      },
    ],
    stringifiedObj = stringifyObjectIds(obj)

  expect(stringifiedObj[0].id).toEqual(res[0].id)
  expect(stringifiedObj[1].id).toEqual(res[1].id)
  expect(stringifiedObj[2].id).toEqual(res[2].id)
})

test(`when passed a deeply nested, complex object literal, it returns all stringified ObjectIds`, () => {
  const str1 = `5c6d85cff2bc0b7a5da61124`,
    str2 = `5c6d85fdf2bc0b7a5da6112a`,
    str3 = `5c6d863df2bc0b7a5da61132`,
    str4 = `5c6d89a9f2bc0b7a5da611da`,
    str5 = `5c6d8c62f2bc0b7a5da61241`,
    str6 = `5c6d8b41f2bc0b7a5da6121a`,
    obj1 = new ObjectID(str1),
    obj2 = new ObjectID(str2),
    obj3 = new ObjectID(str3),
    obj4 = new ObjectID(str4),
    obj5 = new ObjectID(str5),
    obj6 = new ObjectID(str6),
    complexNested = {
      id: obj1,
      connections: [
        {
          id: obj2,
        },
        {
          ids: [obj3, obj4],
        },
      ],
      name: {
        first: `sally`,
        last: {
          maiden: {
            val: `smith`,
            id: obj5,
          },
          current: {
            val: `wilson`,
            id: obj6,
          },
          former: {
            val: `smith`,
            id: obj5,
          },
        },
      },
    },
    res = {
      id: str1,
      connections: [
        {
          id: str2,
        },
        {
          ids: [str3, str4],
        },
      ],
      name: {
        first: `sally`,
        last: {
          maiden: {
            val: `smith`,
            id: str5,
          },
          current: {
            val: `wilson`,
            id: str6,
          },
          former: {
            val: `smith`,
            id: str5,
          },
        },
      },
    },
    stringifiedNested = stringifyObjectIds(complexNested)

  expect(stringifiedNested.id).toEqual(res.id)
  expect(stringifiedNested.connections[0].id).toEqual(res.connections[0].id)
  expect(stringifiedNested.connections[1].ids[0]).toEqual(
    res.connections[1].ids[0]
  )
  expect(stringifiedNested.connections[1].ids[1]).toEqual(
    res.connections[1].ids[1]
  )
  expect(stringifiedNested.name.last.maiden.id).toEqual(res.name.last.maiden.id)
  expect(stringifiedNested.name.last.current.id).toEqual(
    res.name.last.current.id
  )
  expect(stringifiedNested.name.last.former.id).toEqual(res.name.last.former.id)
})

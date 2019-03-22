const stringifyObjectIds = require('../stringifyObjectIds')
const ObjectID = require(`mongodb`).ObjectID

test(`it is a function`, () => {
    expect(stringifyObjectIds).toEqual(expect.any(Function))
})

test(`it returns stringified object id when passed one`, ()=> {
    const objectId = new ObjectID('5c6d85cff2bc0b7a5da61124')
    expect(stringifyObjectIds(objectId)).toEqual('5c6d85cff2bc0b7a5da61124')
})

test(`when passed an array of ObjectIDs it returns an array of strings`, ()=> {
    const str1 = '5c6d85cff2bc0b7a5da61124',
        str2 = '5c6d85fdf2bc0b7a5da6112a',
        str3 = '5c6d863df2bc0b7a5da61132',
        obj1 = new ObjectID(str1),
        obj2 = new ObjectID(str2),
        obj3 = new ObjectID(str3),
        arr = [obj1, obj2, obj3],
        res = [str1, str2, str3];

    expect(JSON.stringify(stringifyObjectIds(arr))).toEqual(JSON.stringify(res))
})


test(`when passed an array of object literals with ObjectIDs it returns an array of object literals with strings`, ()=> {
    const str1 = '5c6d85cff2bc0b7a5da61124',
        str2 = '5c6d85fdf2bc0b7a5da6112a',
        str3 = '5c6d863df2bc0b7a5da61132',
        obj1 = new ObjectID(str1),
        obj2 = new ObjectID(str2),
        obj3 = new ObjectID(str3),
        obj = [{
            key: "one",
            id: obj1
        },{
            key: "two",
            id: obj2
        }, {
            key: "three",
            id: obj3
        }],
        res = [{
            key: "one",
            id: str1
        },{
            key: "two",
            id: str2
        }, {
            key: "three",
            id: str3
        }];

    expect(JSON.stringify(stringifyObjectIds(obj))).toEqual(JSON.stringify(res))
})

test(`when passed a deeply nested, complex object literal, it returns all stringified ObjectIds`, () => {
    const str1 = '5c6d85cff2bc0b7a5da61124',
        str2 = '5c6d85fdf2bc0b7a5da6112a',
        str3 = '5c6d863df2bc0b7a5da61132',
        str4 = '5c6d89a9f2bc0b7a5da611da',
        str5 = '5c6d8c62f2bc0b7a5da61241',
        str6 = '5c6d8b41f2bc0b7a5da6121a',
        obj1 = new ObjectID(str1),
        obj2 = new ObjectID(str2),
        obj3 = new ObjectID(str3),
        obj4 = new ObjectID(str4),
        obj5 = new ObjectID(str5),
        obj6 = new ObjectID(str6),
        complexNested = {
            "id": obj1,
            "connections": [
                {
                    id: obj2
                }, {
                    ids: [obj3, obj4]
                }
            ], 
            "name": {
                "first": "sally",
                "last": {
                    "maiden": {
                        val: "smith",
                        id: obj5
                    },
                    "current": {
                        val: "wilson",
                        id: obj6
                    },
                    "former": {
                        val: "smith",
                        id: obj5
                    },
                }
            }
        },
        res = {
            "id": str1,
            "connections": [
                {
                    id: str2
                }, {
                    ids: [str3, str4]
                }
            ], 
            "name": {
                "first": "sally",
                "last": {
                    "maiden": {
                        val: "smith",
                        id: str5
                    },
                    "current": {
                        val: "wilson",
                        id: str6
                    },
                    "former": {
                        val: "smith",
                        id: str5
                    },
                }
            }
        }

    expect(JSON.stringify(stringifyObjectIds(complexNested))).toEqual(JSON.stringify(res))
})

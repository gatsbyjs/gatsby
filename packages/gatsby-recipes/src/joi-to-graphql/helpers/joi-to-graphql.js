"use strict"

const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
} = require(`graphql`)
const { GraphQLJSONObject } = require(`graphql-type-json`)
const Hoek = require(`@hapi/hoek`)
const TypeDictionary = require(`./type-dictionary`)
const internals = {}
let cache = {}
const lazyLoadQueue = []

module.exports = constructor => {
  let target
  const { name, args, resolve, description } = constructor._meta[0]

  Hoek.assert(
    Hoek.reach(constructor, `_inner.children.length`) > 0,
    `Joi object must have at least 1 key`
  )

  const compiledFields = internals.buildFields(constructor._inner.children)

  if (lazyLoadQueue.length) {
    target = new GraphQLObjectType({
      name,
      description,
      fields: function () {
        return compiledFields(target)
      },
      args: internals.buildArgs(args),
      resolve,
    })
  } else {
    target = new GraphQLObjectType({
      name,
      description,
      fields: compiledFields(),
      args: internals.buildArgs(args),
      resolve,
    })
  }

  return target
}

internals.buildEnumFields = values => {
  const attrs = {}

  for (let i = 0; i < values.length; ++i) {
    attrs[values[i].value] = { value: values[i].derivedFrom }
  }

  return attrs
}

internals.setType = schema => {
  // Helpful for Int or Float

  if (schema._tests.length) {
    if (schema._flags.presence) {
      return {
        type: new TypeDictionary.required(
          TypeDictionary[schema._tests[0].name]
        ),
      }
    }

    return { type: TypeDictionary[schema._tests[0].name] }
  }

  if (schema._flags.presence === `required`) {
    return { type: new TypeDictionary.required(TypeDictionary[schema._type]) }
  }

  if (schema._flags.allowOnly) {
    // GraphQLEnumType

    const name = Hoek.reach(schema, `_meta.0.name`) || `Anon`

    const config = {
      name,
      values: internals.buildEnumFields(schema._valids._set),
    }

    return { type: new TypeDictionary.enum(config) }
  }

  return { type: TypeDictionary[schema._type] }
}

internals.processLazyLoadQueue = (attrs, recursiveType) => {
  for (let i = 0; i < lazyLoadQueue.length; ++i) {
    if (lazyLoadQueue[i].type === `object`) {
      attrs[lazyLoadQueue[i].key] = { type: recursiveType }
    } else {
      attrs[lazyLoadQueue[i].key] = {
        type: new TypeDictionary[lazyLoadQueue[i].type](recursiveType),
      }
    }
  }

  return attrs
}

internals.buildFields = fields => {
  const attrs = {}

  for (let i = 0; i < fields.length; ++i) {
    const field = fields[i]
    const key = field.key

    if (field.schema._type === `object`) {
      let Type
      if (!field.schema._inner.children) {
        // When there's an object with no children that means we've
        // called Joi.object() and permit any key. As such let's specify
        // a JSON GraphQL object type that's just as permissive.
        Type = GraphQLJSONObject
      } else {
        Type = new GraphQLObjectType({
          name: field.key.charAt(0).toUpperCase() + field.key.slice(1),
          fields: internals.buildFields(field.schema._inner.children),
        })
      }

      attrs[key] = {
        type: Type,
      }

      cache[key] = Type
    }

    if (field.schema._type === `array`) {
      let Type
      const pathToMethod = `schema._inner.items.0._flags.lazy`

      if (Hoek.reach(field, pathToMethod)) {
        Type = field.schema._inner.items[0]._description

        lazyLoadQueue.push({
          key,
          type: field.schema._type,
        })
      } else {
        Hoek.assert(
          field.schema._inner.items.length > 0,
          `Need to provide scalar type as an item when using joi array`
        )

        if (Hoek.reach(field, `schema._inner.items.0._type`) === `object`) {
          const { name } = Hoek.reach(field, `schema._inner.items.0._meta.0`)
          const Item = new GraphQLObjectType({
            name,
            fields: internals.buildFields(
              field.schema._inner.items[0]._inner.children
            ),
          })
          Type = new GraphQLList(Item)
        } else {
          Type = new GraphQLList(
            TypeDictionary[field.schema._inner.items[0]._type]
          )
        }
      }

      attrs[key] = {
        type: Type,
      }

      cache[key] = Type
    }

    if (field.schema._type === `lazy`) {
      const Type = field.schema._description

      lazyLoadQueue.push({
        key,
        type: `object`,
      })

      attrs[key] = {
        type: Type,
      }

      cache[key] = Type
    }

    if (cache[key]) {
      continue
    }

    attrs[key] = internals.setType(field.schema)
  }

  cache = Object.create(null) //Empty cache

  return function (recursiveType) {
    if (recursiveType) {
      return internals.processLazyLoadQueue(attrs, recursiveType)
    }

    return attrs
  }
}

internals.buildArgs = args => {
  const argAttrs = {}

  for (const key in args) {
    if (args[key]._type === `object`) {
      argAttrs[key] = {
        type: new GraphQLInputObjectType({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          fields: internals.buildFields(args[key]._inner.children),
        }),
      }
    } else {
      argAttrs[key] = { type: TypeDictionary[args[key]._type] }
    }
  }

  return argAttrs
}

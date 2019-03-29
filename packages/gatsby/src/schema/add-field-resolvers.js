const _ = require(`lodash`)
const { defaultFieldResolver } = require(`graphql`)
const { dateResolver } = require(`./types/date`)
const { link, fileByPath } = require(`./resolvers`)

export const addFieldResolvers = ({
  schemaComposer,
  typeComposer,
  parentSpan,
}) => {
  typeComposer.getFieldNames().forEach(fieldName => {
    let field = typeComposer.getField(fieldName)

    const extensions = typeComposer.getFieldExtensions(fieldName)

    if (!field.resolve && extensions.resolver) {
      const options = extensions.resolverOptions || {}
      switch (extensions.resolver) {
        case `date`: {
          addDateResolver({
            typeComposer,
            fieldName,
            options: extensions.resolverOptions || {},
          })
          break
        }
        case `link`: {
          typeComposer.extendField(fieldName, {
            resolve: link({ from: options.from, by: options.by }),
          })
          break
        }
        case `relativeFile`: {
          typeComposer.extendField(fieldName, {
            resolve: fileByPath({ from: options.from }),
          })
          break
        }
      }
    }

    if (extensions.proxyFrom) {
      // XXX(freiksenet): get field again cause it will be changed because of above
      field = typeComposer.getField(fieldName)
      const resolver = field.resolve || defaultFieldResolver
      typeComposer.extendField(fieldName, {
        resolve: (source, args, context, info) =>
          resolver(source, args, context, {
            ...info,
            fieldName: extensions.proxyFrom,
          }),
      })
    }
  })
  return typeComposer
}

const addDateResolver = ({
  typeComposer,
  fieldName,
  options: { defaultFormat, defaultLocale },
}) => {
  const field = typeComposer.getField(fieldName)

  let options = {
    resolve: dateResolver.resolve,
  }
  if (!field.args || _.isEmpty(field.args)) {
    options.args = {
      ...dateResolver.args,
    }
    if (defaultFormat) {
      options.args.formatString.defaultValue = defaultFormat
    }
    if (defaultLocale) {
      options.args.formatString.defaultLocale = defaultLocale
    }
  }

  typeComposer.extendField(fieldName, options)
}

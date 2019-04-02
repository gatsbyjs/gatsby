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
    if (
      !field.resolve &&
      extensions.addResolver &&
      _.isObject(extensions.addResolver)
    ) {
      const options = extensions.addResolver.options || {}
      switch (extensions.addResolver.type) {
        case `date`: {
          addDateResolver({
            typeComposer,
            fieldName,
            options,
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

  let fieldConfig = {
    resolve: dateResolver.resolve,
  }
  if (!field.args || _.isEmpty(field.args)) {
    fieldConfig.args = {
      ...dateResolver.args,
    }
    if (defaultFormat) {
      fieldConfig.args.formatString.defaultValue = defaultFormat
    }
    if (defaultLocale) {
      fieldConfig.args.formatString.defaultLocale = defaultLocale
    }
  }

  typeComposer.extendField(fieldName, fieldConfig)
}

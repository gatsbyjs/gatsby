const {
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLDirective,
  GraphQLString,
  DirectiveLocation,
  defaultFieldResolver,
} = require(`graphql`)
const { GraphQLJSON } = require(`graphql-compose`)
const report = require(`gatsby-cli/lib/reporter`)

const { link, fileByPath } = require(`../resolvers`)
const { getDateResolver } = require(`../types/date`)

// Reserved for internal use
const internalExtensionNames = [
  `addDefaultResolvers`,
  `createdFrom`,
  `directives`,
  `infer`,
  `plugin`,
]

const typeExtensions = {
  infer: {
    description: `Infer field types from field values.`,
    args: {
      noDefaultResolvers: {
        type: GraphQLBoolean,
        description: `Don't add default resolvers to defined fields.`,
        deprecationReason: `noDefaultResolvers is deprecated, annotate individual fields.`,
      },
    },
  },
  dontInfer: {
    description: `Do not infer field types from field values.`,
    args: {
      noDefaultResolvers: {
        type: GraphQLBoolean,
        description: `Don't add default resolvers to defined fields.`,
        deprecationReason: `noDefaultResolvers is deprecated, annotate individual fields.`,
      },
    },
  },
}

const fieldExtensions = {
  add: {
    description: `Generic directive to add field extension.`,
    args: {
      extension: {
        type: new GraphQLNonNull(GraphQLString),
      },
      options: {
        type: GraphQLJSON,
      },
    },
  },

  addResolver: {
    description: `Add a resolver specified by "type" to field.`,
    args: {
      type: {
        type: new GraphQLNonNull(GraphQLString),
        description:
          `Type of the resolver. Types available by default are: ` +
          `"dateformat", "link" and "fileByRelativePath".`,
      },
      options: {
        type: GraphQLJSON,
        description: `Resolver options. Vary based on resolver type.`,
      },
    },
    process(args, fieldConfig) {
      const { process } = fieldExtensions[args.type] || {}
      if (typeof process === `function`) {
        return process(args.options || {}, fieldConfig)
      }
      return {}
    },
  },

  dateformat: {
    description: `Add date formating options.`,
    args: {
      formatString: { type: GraphQLString },
      locale: { type: GraphQLString },
    },
    process(args, fieldConfig) {
      return getDateResolver(args)
    },
  },

  link: {
    description: `Link to node by foreign-key relation.`,
    args: {
      by: {
        type: new GraphQLNonNull(GraphQLString),
        defaultValue: `id`,
      },
      from: {
        type: GraphQLString,
      },
    },
    process(args, fieldConfig) {
      return {
        resolve: link(args),
      }
    },
  },

  fileByRelativePath: {
    description: `Link to File node by relative path.`,
    args: {
      from: {
        type: GraphQLString,
      },
    },
    process(args, fieldConfig) {
      return {
        resolve: fileByPath(args),
      }
    },
  },

  // projection: {
  //   description: `Automatically add fields to selection set.`,
  //   args: {},
  //   process(args, fieldConfig) {},
  // },

  proxyFrom: {
    description: `Proxy resolver from another field.`,
    process(from, fieldConfig) {
      const resolver = fieldConfig.resolve || defaultFieldResolver
      return {
        resolve(source, args, context, info) {
          return resolver(source, args, context, {
            ...info,
            fieldName: from,
          })
        },
      }
    },
  },
}

const toDirectives = ({ extensions, locations }) =>
  Object.keys(extensions).map(name => {
    const extension = extensions[name]
    const { args, description } = extension
    return new GraphQLDirective({ name, args, description, locations })
  })

const addDirectives = ({ schemaComposer }) => {
  const fieldDirectives = toDirectives({
    extensions: fieldExtensions,
    locations: [DirectiveLocation.FIELD_DEFINITION],
  })
  fieldDirectives.forEach(directive => schemaComposer.addDirective(directive))
  const typeDirectives = toDirectives({
    extensions: typeExtensions,
    locations: [DirectiveLocation.OBJECT],
  })
  typeDirectives.forEach(directive => schemaComposer.addDirective(directive))
}

const processFieldExtensions = ({
  schemaComposer,
  typeComposer,
  parentSpan,
}) => {
  typeComposer.getFieldNames().forEach(fieldName => {
    const extensions = typeComposer.getFieldExtensions(fieldName)
    Object.keys(extensions)
      .filter(name => !internalExtensionNames.includes(name))
      .sort(a => a === `proxyFrom`) // Ensure `proxyFrom` is run last
      .forEach(name => {
        const { process } = fieldExtensions[name] || {}
        if (process) {
          // Always get fresh field config as it will have been changed
          // by previous field extension
          const prevFieldConfig = typeComposer.getFieldConfig(fieldName)
          typeComposer.extendField(
            fieldName,
            process(extensions[name], prevFieldConfig)
          )
        }
      })
  })
}

const registerFieldExtension = (name, extension) => {
  if (internalExtensionNames.includes(name)) {
    report.error(`The extension ${name} is reserved for internal use.`)
  } else if (!fieldExtensions[name]) {
    fieldExtensions[name] = extension
  } else {
    report.error(
      `A field extension with the name ${name} is already registered.`
    )
  }
}

module.exports = {
  addDirectives,
  fieldExtensions,
  processFieldExtensions,
  registerFieldExtension,
}

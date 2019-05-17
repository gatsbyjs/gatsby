const {
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLDirective,
  GraphQLString,
  DirectiveLocation,
  defaultFieldResolver,
} = require(`graphql`)

const { link, fileByPath } = require(`../resolvers`)
const { getDateResolver } = require(`../types/date`)

// Reserved for internal use
const internalExtensionNames = [`createdFrom`, `directives`, `infer`, `plugin`]

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

  proxy: {
    description: `Proxy resolver from another field.`,
    args: {
      from: {
        type: GraphQLString,
      },
    },
    process({ from }, fieldConfig) {
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
      .sort(a => a === `proxy`) // Ensure `proxy` is run last
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

module.exports = {
  addDirectives,
  processFieldExtensions,
}

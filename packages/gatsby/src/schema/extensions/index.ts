import {
  GraphQLDirective,
  DirectiveLocation,
  specifiedDirectives,
} from "graphql";

import { link, fileByPath } from "../resolvers";
import {
  type DateResolver,
  type IDateResolverOption,
  getDateResolver,
} from "../types/date";

import type {
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldConfig,
} from "graphql";
import type { ComposeOutputType } from "graphql-compose";
import type { GatsbyResolver } from "../type-definitions";

export type GraphQLFieldExtensionDefinition = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type?: ComposeOutputType<any> | undefined;
  args?: GraphQLFieldConfigArgumentMap | undefined;
  extend(
    args: GraphQLFieldConfigArgumentMap,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevFieldConfig: GraphQLFieldConfig<any, any, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any;
};

export const inferExtensionName = "infer";
export const dontInferExtensionName = "dontInfer";

const typeExtensions = {
  [inferExtensionName]: {
    description: "Infer field types from field values.",
  },
  [dontInferExtensionName]: {
    description: "Do not infer field types from field values.",
  },
  mimeTypes: {
    description: "Define the mime-types handled by this type.",
    args: {
      types: {
        type: "[String!]!",
        defaultValue: [],
        description: "The mime-types handled by this type.",
      },
    },
  },
  childOf: {
    description:
      "Define parent-child relations between types. This is used to add " +
      "`child*` and `children*` convenience fields like `childImageSharp`.",
    args: {
      mimeTypes: {
        type: "[String!]!",
        defaultValue: [],
        description:
          "A list of mime-types this type is a child of. Usually these are " +
          "the mime-types handled by a transformer plugin.",
      },
      types: {
        type: "[String!]!",
        defaultValue: [],
        description:
          "A list of types this type is a child of. Usually these are the " +
          "types handled by a transformer plugin.",
      },
    },
  },
  nodeInterface: {
    description:
      'DEPRECATED: Use interface inheritance instead, i.e. "interface Foo implements Node".\n\n' +
      "Adds root query fields for an interface. All implementing types " +
      "must also implement the Node interface.",
    locations: [DirectiveLocation.INTERFACE],
  },
};

export const builtInFieldExtensions = {
  dateformat: {
    name: "dateformat",
    description: "Add date formatting options.",
    args: {
      formatString: "String",
      locale: "String",
      fromNow: "Boolean",
      difference: "String",
    },
    extend(
      args,
      fieldConfig,
    ): {
      args: IDateResolverOption;
      resolve: DateResolver;
    } {
      return getDateResolver(args, fieldConfig);
    },
  },

  link: {
    name: "link",
    description: "Link to node by foreign-key relation.",
    args: {
      by: {
        type: "String!",
        defaultValue: "id",
      },
      from: "String",
      on: "String",
    },
    extend(
      args,
      fieldConfig,
      schemaComposer,
    ): {
      resolve: GatsbyResolver<unknown, unknown>;
    } {
      const type =
        args.on &&
        schemaComposer.typeMapper.convertSDLWrappedTypeName(args.on)?.getType();
      return {
        resolve: link({ ...args, type }, fieldConfig),
      };
    },
  },

  fileByRelativePath: {
    name: "fileByRelativePath",
    description: "Link to File node by relative path.",
    args: {
      from: "String",
    },
    extend(
      args,
      fieldConfig,
    ): {
      resolve: GatsbyResolver<unknown, unknown>;
    } {
      return {
        resolve: fileByPath(args, fieldConfig),
      };
    },
  },

  proxy: {
    name: "proxy",
    description: "Proxy resolver from another field.",
    args: {
      from: "String!",
      fromNode: {
        type: "Boolean!",
        defaultValue: false,
      },
    },
    extend(
      options,
      fieldConfig,
    ): {
      resolve: GatsbyResolver<unknown, unknown>;
    } {
      return {
        resolve(source, args, context, info): GatsbyResolver<unknown, unknown> {
          const resolver = fieldConfig.resolve || context.defaultFieldResolver;
          return resolver(source, args, context, {
            ...info,
            from: options.from || info.from,
            fromNode: options.from ? options.fromNode : info.fromNode,
          });
        },
      };
    },
  },
};

// Reserved for internal use
export const internalExtensionNames = [
  "createdFrom",
  "default",
  "directives",
  "infer",
  "plugin",
  ...specifiedDirectives.map((directive) => directive.name),
];
export const reservedExtensionNames = [
  ...internalExtensionNames,
  ...Object.keys(builtInFieldExtensions),
];

function toDirectives({
  schemaComposer,
  extensions,
  locations: defaultLocations,
}): Array<GraphQLDirective> {
  return Object.keys(extensions).map((name: string): GraphQLDirective => {
    const extension = extensions[name];
    const { args, description, locations, type } = extension;
    // Allow field extensions to register a return type
    if (type) {
      schemaComposer.createTC(type);
    }
    // Support the `graphql-compose` style of directly providing the field type as string
    const normalizedArgs = schemaComposer.typeMapper.convertArgConfigMap(args);

    // arg.type is a composer that needs to be converted to graphql-js type
    Object.keys(normalizedArgs).forEach((argName) => {
      normalizedArgs[argName].type = normalizedArgs[argName].type.getType();
    });

    return new GraphQLDirective({
      name,
      args: normalizedArgs,
      description,
      locations: locations || defaultLocations,
    });
  });
}

export function addDirectives({ schemaComposer, fieldExtensions = {} }): void {
  const fieldDirectives = toDirectives({
    schemaComposer,
    extensions: fieldExtensions,
    locations: [DirectiveLocation.FIELD_DEFINITION],
  });
  fieldDirectives.forEach((directive) =>
    schemaComposer.addDirective(directive),
  );
  const typeDirectives = toDirectives({
    schemaComposer,
    extensions: typeExtensions,
    locations: [DirectiveLocation.OBJECT],
  });
  typeDirectives.forEach((directive) => schemaComposer.addDirective(directive));
}

export function processFieldExtensions({
  fieldExtensions = {},
  schemaComposer,
  typeComposer,
  // _parentSpan,
}): void {
  typeComposer.getFieldNames().forEach((fieldName) => {
    const extensions = typeComposer.getFieldExtensions(fieldName);
    Object.keys(extensions)
      .filter((name) => !internalExtensionNames.includes(name))
      .forEach((name) => {
        const { extend } = fieldExtensions[name] || {};
        if (typeof extend === "function") {
          // Always get fresh field config as it will have been changed
          // by previous field extension
          const prevFieldConfig = typeComposer.getFieldConfig(fieldName);
          typeComposer.extendField(
            fieldName,
            extend(extensions[name], prevFieldConfig, schemaComposer),
          );
        }
      });
  });
}

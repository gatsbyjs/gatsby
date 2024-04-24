import report from "gatsby-cli/lib/reporter";
import { ObjectTypeComposer } from "graphql-compose";
import { hasNodes } from "./inference-metadata";
import { getExampleObject } from "./build-example-data";
import { addNodeInterface } from "../types/node-interface";
import { addInferredFields } from "./add-inferred-fields";
import { getDataStore } from "../../datastore";

export function addInferredTypes({
  schemaComposer,
  typeConflictReporter,
  typeMapping,
  inferenceMetadata,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schemaComposer: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeConflictReporter: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeMapping: { typeMap: Record<string, string> };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inferenceMetadata: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Array<any> {
  // XXX(freiksenet): Won't be needed after plugins set typedefs
  // Infer File first so all the links to it would work
  const { typeMap } = inferenceMetadata;
  const typesWithNodes = Object.keys(typeMap).filter(
    (typeName: string): boolean => {
      return hasNodes(typeMap[typeName]);
    },
  );
  const typeNames = putFileFirst(typesWithNodes);
  const noNodeInterfaceTypes: Array<string> = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typesToInfer: Array<any> = [];

  typeNames.forEach((typeName) => {
    let typeComposer;
    if (schemaComposer.has(typeName)) {
      typeComposer = schemaComposer.getOTC(typeName);
      const runInfer = typeComposer.hasExtension("infer")
        ? typeComposer.getExtension("infer")
        : true;
      if (runInfer) {
        if (!typeComposer.hasInterface("Node")) {
          noNodeInterfaceTypes.push(typeName);
        }
        typesToInfer.push(typeComposer);
      }
    } else {
      typeComposer = ObjectTypeComposer.create(typeName, schemaComposer);
      addNodeInterface({ schemaComposer, typeComposer });
      typeComposer.setExtension("createdFrom", "inference");
      typesToInfer.push(typeComposer);
    }
  });

  if (noNodeInterfaceTypes.length > 0) {
    noNodeInterfaceTypes.forEach((typeName) => {
      report.warn(
        `Type \`${typeName}\` declared in \`createTypes\` looks like a node, ` +
          "but doesn't implement a `Node` interface. It's likely that you should " +
          "add the `Node` interface to your type def:\n\n" +
          `\`type ${typeName} implements Node { ... }\`\n\n` +
          "If you know that you don't want it to be a node (which would mean no " +
          "root queries to retrieve it), you can explicitly disable inference " +
          "for it:\n\n" +
          `\`type ${typeName} @dontInfer { ... }\``,
      );
    });
    report.panic("Building schema failed");
  }

  return typesToInfer.map((typeComposer) =>
    addInferredType({
      schemaComposer,
      typeComposer,
      typeConflictReporter,
      typeMapping,
      inferenceMetadata,
    }),
  );
}

export function addInferredType({
  schemaComposer,
  typeComposer,
  typeConflictReporter,
  typeMapping,
  inferenceMetadata = { typeMap: new Map() },
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schemaComposer: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeComposer: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeConflictReporter: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeMapping: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inferenceMetadata?: { typeMap: Map<string, unknown> } | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): any {
  const typeName = typeComposer.getTypeName();
  // TODO: Move this to where the type is created once we can get
  // node type owner information directly from store
  if (
    typeComposer.getExtension("createdFrom") === "inference" &&
    hasNodes(inferenceMetadata.typeMap?.[typeName])
  ) {
    let firstNode;
    for (const node of getDataStore().iterateNodesByType(typeName)) {
      firstNode = node;
      break;
    }
    if (firstNode) {
      typeComposer.setExtension("plugin", firstNode.internal.owner);
    }
  }

  const exampleValue = getExampleObject({
    ...inferenceMetadata.typeMap?.[typeName],
    typeName,
    typeConflictReporter,
  });

  addInferredFields({
    schemaComposer,
    typeComposer,
    exampleValue,
    typeMapping,
  });
  return typeComposer;
}

function putFileFirst(typeNames: Array<string>): Array<string> {
  const index = typeNames.indexOf("File");
  if (index !== -1) {
    return [
      "File",
      ...typeNames.slice(0, index),
      ...typeNames.slice(index + 1),
    ];
  } else {
    return typeNames;
  }
}

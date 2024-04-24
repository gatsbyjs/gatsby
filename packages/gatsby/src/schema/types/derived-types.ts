/**
 * Derived types are types that make sense only when their base type exists
 *
 * Take this node for example:
 * {
 *   internal: { type: 'Foo' },
 *   fields: {
 *     bar: "string",
 *   }
 * }
 *
 * It will produce following types:
 * Foo
 * FooFields
 *
 * FooInputFilter
 * FooSortInput
 *
 * FooFieldsInputFilter
 * FooFieldsSortFilter
 * etc
 *
 * Derived types:
 *   Foo: FooFields, FooInputFilter, FooSortInput
 *   FooFields: FooFieldsInputFilter, FooFieldsSortFilter
 *
 * Caveats:
 *   Only types created via inference are marked as derived. So if in the example above
 *   user explicitly defines `FooFields` type (via `createTypes` call) it won't be considered
 *   a derived type
 */
import {
  ObjectTypeComposer,
  InterfaceTypeComposer,
  ScalarTypeComposer,
  SchemaComposer,
  InputTypeComposer,
  EnumTypeComposer,
  UnionTypeComposer,
} from "graphql-compose";

type AllTypeComposer =
  | ObjectTypeComposer
  | InputTypeComposer
  | EnumTypeComposer
  | InterfaceTypeComposer
  | UnionTypeComposer
  | ScalarTypeComposer;

function getDerivedTypes({
  typeComposer,
}: {
  typeComposer: AllTypeComposer;
}): Set<string> {
  const derivedTypes = typeComposer.getExtension("derivedTypes");
  if (derivedTypes) {
    return derivedTypes as Set<string>;
  }

  return new Set<string>();
}

function removeTypeFromSchemaComposer({
  schemaComposer,
  typeComposer,
}: {
  schemaComposer: SchemaComposer<string>;
  typeComposer: AllTypeComposer;
}): void {
  schemaComposer.delete(typeComposer.getTypeName());
  schemaComposer.delete(typeComposer._gqType);
  schemaComposer.delete(typeComposer);
}

export const clearDerivedTypes = ({
  schemaComposer,
  typeComposer,
}: {
  schemaComposer: SchemaComposer<string>;
  typeComposer: AllTypeComposer;
}): void => {
  const derivedTypes = getDerivedTypes({ typeComposer });

  for (const typeName of derivedTypes.values()) {
    const derivedTypeComposer = schemaComposer.getAnyTC(typeName);
    clearDerivedTypes({ schemaComposer, typeComposer: derivedTypeComposer });
    removeTypeFromSchemaComposer({
      schemaComposer,
      typeComposer: derivedTypeComposer,
    });
  }

  if (
    typeComposer instanceof ObjectTypeComposer ||
    typeComposer instanceof InterfaceTypeComposer
  ) {
    const inputTypeComposer = typeComposer.getInputTypeComposer();
    removeTypeFromSchemaComposer({
      schemaComposer,
      typeComposer: inputTypeComposer,
    });
    typeComposer.removeInputTypeComposer();
  }

  typeComposer.setExtension("derivedTypes", new Set());
};

export const addDerivedType = ({
  typeComposer,
  derivedTypeName,
}: {
  typeComposer: AllTypeComposer;
  derivedTypeName: string;
}): void => {
  const derivedTypes = getDerivedTypes({ typeComposer });
  typeComposer.setExtension("derivedTypes", derivedTypes.add(derivedTypeName));
};

import {
  NameNode,
  FieldNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  SelectionSetNode,
  SelectionNode,
  NamedTypeNode,
  FragmentSpreadNode,
  InlineFragmentNode,
  ArgumentNode,
  ValueNode,
  BooleanValueNode,
  StringValueNode,
  DirectiveNode,
  DocumentNode,
  ASTNode,
  DefinitionNode,
} from "graphql"

export function document(definitions: DefinitionNode[]): DocumentNode {
  return {
    kind: `Document`,
    definitions,
  }
}

export function fragmentDefinition(
  fragmentName: string,
  typeName: string,
  selections: SelectionNode[]
): FragmentDefinitionNode {
  return {
    kind: `FragmentDefinition`,
    name: name(fragmentName ?? typeName),
    typeCondition: namedType(typeName),
    selectionSet: selectionSet(selections),
  }
}

export function inlineFragment(
  typeCondition: string,
  selections: readonly SelectionNode[]
): InlineFragmentNode {
  return {
    kind: `InlineFragment`,
    typeCondition: namedType(typeCondition),
    selectionSet: selectionSet(selections),
  }
}

export function selectionSet(
  selections: readonly SelectionNode[] = []
): SelectionSetNode {
  return {
    kind: `SelectionSet`,
    selections: selections,
  }
}

export function field(
  fieldName: string,
  alias?: string,
  args?: ArgumentNode[],
  selections?: SelectionNode[],
  directives?: DirectiveNode[]
): FieldNode {
  return {
    kind: `Field`,
    name: name(fieldName),
    alias: alias ? name(alias) : undefined,
    arguments: args,
    selectionSet: selectionSet(selections),
    directives,
  }
}

export function arg(argName: string, value: ValueNode): ArgumentNode {
  return {
    kind: `Argument`,
    name: name(argName),
    value,
  }
}

export function name(value: string): NameNode {
  return {
    kind: `Name`,
    value: value,
  }
}

export function namedType(typeName: string): NamedTypeNode {
  return {
    kind: `NamedType`,
    name: name(typeName),
  }
}

export function fragmentSpread(fragmentName: string): FragmentSpreadNode {
  return {
    kind: `FragmentSpread`,
    name: name(fragmentName),
  }
}

export function directive(
  directiveName: string,
  args?: ArgumentNode[]
): DirectiveNode {
  return {
    kind: `Directive`,
    name: name(directiveName),
    arguments: args,
  }
}

export function skipDirective(condition: boolean = true) {
  return directive(`skip`, [arg(`if`, boolValue(condition))])
}

export function boolValue(value: boolean): BooleanValueNode {
  return {
    kind: `BooleanValue`,
    value,
  }
}

export function stringValue(value: string): StringValueNode {
  return {
    kind: `StringValue`,
    value,
  }
}

export function isFragment(node: ASTNode): node is FragmentDefinitionNode {
  return node.kind === `FragmentDefinition`
}

export function isOperation(node: ASTNode): node is OperationDefinitionNode {
  return node.kind === `OperationDefinition`
}

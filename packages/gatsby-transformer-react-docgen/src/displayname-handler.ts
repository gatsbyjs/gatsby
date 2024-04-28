import path from "node:path";
import { namedTypes as types } from "ast-types";
import { utils, type Documentation, type NodePath } from "react-docgen";
import type {
  Node,
  CallExpression,
  ClassDeclaration,
  ClassExpression,
  ObjectExpression,
  TaggedTemplateExpression,
  VariableDeclaration,
} from "@babel/types";
import type { StatelessComponentNode } from "react-docgen/dist/resolver";

type SupportedNodes =
  | CallExpression
  | ClassDeclaration
  | ClassExpression
  | ObjectExpression
  | StatelessComponentNode
  | TaggedTemplateExpression
  | VariableDeclaration;

const { getMemberValuePath, getNameOrValue, isExportsOrModuleAssignment } =
  utils;

const DEFAULT_NAME = "UnknownComponent";

function getNameFromPath(path: NodePath): string | number | boolean | null {
  const node = path.node;

  switch (node.type) {
    // @ts-ignore Property 'name' does not exist on type 'Type<Identifier>'.
    // Property 'name' does not exist on type 'ArrayType<Identifier>'.ts(2339)
    case types.Identifier.name:

    // @ts-ignore Property 'name' does not exist on type 'Type<Literal>'.
    // Property 'name' does not exist on type 'ArrayType<Literal>'.ts(2339)
    // eslint-disable-next-line no-fallthrough
    case types.Literal.name: {
      return getNameOrValue(path);
    }
    // @ts-ignore Property 'name' does not exist on type 'Type<MemberExpression>'.
    // Property 'name' does not exist on type 'ArrayType<MemberExpression>'.ts(2339)
    case types.MemberExpression.name:
      return utils.getMembers(path).reduce(
        (name, { path, computed }) => {
          return computed && getNameFromPath(path)
            ? name
            : `${name}.${getNameFromPath(path) || ""}`;
        },
        // @ts-ignore Argument of type 'NodePath<Node> | NodePath<Node>[]' is not assignable to parameter of type 'NodePath<Node>'.
        // Type 'NodePath<Node>[]' is missing the following properties from type 'NodePath<Node>': parent, hub, data, context, and 721 more.ts(2345)
        getNameFromPath(path.get("object")),
      );
    default:
      return null;
  }
}

function getStaticDisplayName(
  path: NodePath<SupportedNodes>,
): string | number | boolean | null {
  let displayName: string | number | boolean | null = null;
  const staticMember: NodePath | null = getMemberValuePath(path, "displayName");
  if (staticMember && types.Literal.check(staticMember.node)) {
    displayName = getNameFromPath(staticMember);
  }

  return displayName ?? null;
}

function getNodeIdentifier(path: NodePath): string | number | boolean | null {
  let displayName: string | number | boolean | null = null;
  if (
    types.FunctionExpression.check(path.node) ||
    types.FunctionDeclaration.check(path.node) ||
    types.ClassExpression.check(path.node) ||
    types.ClassDeclaration.check(path.node)
  ) {
    // @ts-ignore Argument of type 'NodePath<Node> | NodePath<Node>[]' is not assignable to parameter of type 'NodePath<Node>'.
    // Type 'NodePath<Node>[]' is not assignable to type 'NodePath<Node>'.ts(2345)
    displayName = getNameFromPath(path.get("id"));
  }

  return displayName || null;
}

function getVariableIdentifier(
  path: NodePath,
): string | number | boolean | null {
  let displayName: string | number | boolean | null = null;
  let searchPath: NodePath<Node> | null = path;

  while (searchPath !== null) {
    if (types.VariableDeclarator.check(searchPath.node)) {
      // @ts-ignore Argument of type 'NodePath<Node> | NodePath<Node>[]' is not assignable to parameter of type 'NodePath<Node>'.
      // Type 'NodePath<Node>[]' is not assignable to type 'NodePath<Node>'.ts(2345)
      displayName = getNameFromPath(searchPath.get("id"));
      break;
    }
    if (
      types.AssignmentExpression.check(searchPath.node) &&
      !isExportsOrModuleAssignment(searchPath)
    ) {
      // @ts-ignore Argument of type 'NodePath<Node> | NodePath<Node>[]' is not assignable to parameter of type 'NodePath<Node>'.
      // Type 'NodePath<Node>[]' is not assignable to type 'NodePath<Node>'.ts(2345)
      displayName = getNameFromPath(searchPath.get("left"));
      break;
    }
    searchPath = searchPath.parentPath;
  }

  return displayName || null;
}

function getNameFromFilePath(filePath: string = ""): string | null {
  let displayName: string | null = null;

  const filename = path.basename(filePath, path.extname(filePath));
  if (filename === "index") {
    const parts = path.dirname(filePath).split(path.sep);
    displayName = parts[parts.length - 1];
  } else {
    displayName = filename;
  }

  return displayName
    .charAt(0)
    .toUpperCase()
    .concat(displayName.slice(1))
    .replace(/-([a-z])/, (_, match) => match.toUpperCase());
}

export function createDisplayNameHandler(
  filePath: string,
): (documentation: Documentation, path: NodePath) => void {
  return function displayNameHandler(
    documentation: Documentation,
    path: NodePath,
  ): void {
    let displayName: string | null = [
      getStaticDisplayName,
      getNodeIdentifier,
      getVariableIdentifier,
    ].reduce((name, getDisplayName) => {
      // @ts-ignore Argument of type 'NodePath<Node>' is not assignable to parameter of type 'NodePath<SupportedNodes>'.
      // Type 'Node' is not assignable to type 'SupportedNodes' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
      // Type 'AnyTypeAnnotation' is not assignable to type 'SupportedNodes' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
      // Type 'AnyTypeAnnotation' is missing the following properties from type 'VariableDeclaration': kind, declarationsts(2345)
      return name ?? getDisplayName(path);
    }, "");

    if (!displayName) {
      displayName = getNameFromFilePath(filePath);
    }

    // @ts-ignore Property 'set' does not exist on type 'Documentation'.ts(2339
    documentation.set("displayName", displayName || DEFAULT_NAME);
  };
}

export default createDisplayNameHandler("");

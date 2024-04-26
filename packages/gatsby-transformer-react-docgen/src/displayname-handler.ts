/* @flow */

import path from "path";
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
    case types.Identifier.name:
    case types.Literal.name:
      return getNameOrValue(path);
    case types.MemberExpression.name:
      return utils.getMembers(path).reduce(
        (name, { path, computed }) => {
          return computed && getNameFromPath(path)
            ? name
            : `${name}.${getNameFromPath(path) || ""}`;
        },
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
      displayName = getNameFromPath(searchPath.get("id"));
      break;
    }
    if (
      types.AssignmentExpression.check(searchPath.node) &&
      !isExportsOrModuleAssignment(searchPath)
    ) {
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
    ].reduce((name, getDisplayName) => name || getDisplayName(path), "");

    if (!displayName) {
      displayName = getNameFromFilePath(filePath);
    }

    documentation.set("displayName", displayName || DEFAULT_NAME);
  };
}

export default createDisplayNameHandler("");

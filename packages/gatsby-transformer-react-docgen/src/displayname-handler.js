/* @flow */

const path = require(`path`)
const { namedTypes: types } = require(`ast-types`)
const { utils } = require(`react-docgen`)

const { getMemberValuePath, getNameOrValue, isExportsOrModuleAssignment } =
  utils

const DEFAULT_NAME = `UnknownComponent`

function getNameFromPath(path: NodePath): ?string {
  const node = path.node
  switch (node.type) {
    case types.Identifier.name:
    case types.Literal.name:
      return getNameOrValue(path)
    case types.MemberExpression.name:
      return utils
        .getMembers(path)
        .reduce(
          (name, { path, computed }) =>
            computed && getNameFromPath(path)
              ? name
              : `${name}.${getNameFromPath(path) || ``}`,
          getNameFromPath(path.get(`object`))
        )
    default:
      return null
  }
}

function getStaticDisplayName(path: NodePath): ?string {
  let displayName = null
  const staticMember: ?NodePath = getMemberValuePath(path, `displayName`)
  if (staticMember && types.Literal.check(staticMember.node)) {
    displayName = getNameFromPath(staticMember)
  }

  return displayName || null
}

function getNodeIdentifier(path: NodePath): ?string {
  let displayName = null
  if (
    types.FunctionExpression.check(path.node) ||
    types.FunctionDeclaration.check(path.node) ||
    types.ClassExpression.check(path.node) ||
    types.ClassDeclaration.check(path.node)
  ) {
    displayName = getNameFromPath(path.get(`id`))
  }

  return displayName || null
}

function getVariableIdentifier(path: NodePath): ?string {
  let displayName = null
  let searchPath = path

  while (searchPath !== null) {
    if (types.VariableDeclarator.check(searchPath.node)) {
      displayName = getNameFromPath(searchPath.get(`id`))
      break
    }
    if (
      types.AssignmentExpression.check(searchPath.node) &&
      !isExportsOrModuleAssignment(searchPath)
    ) {
      displayName = getNameFromPath(searchPath.get(`left`))
      break
    }
    searchPath = searchPath.parentPath
  }

  return displayName || null
}

function getNameFromFilePath(filePath: string = ``): ?string {
  let displayName = null

  const filename = path.basename(filePath, path.extname(filePath))
  if (filename === `index`) {
    const parts = path.dirname(filePath).split(path.sep)
    displayName = parts[parts.length - 1]
  } else {
    displayName = filename
  }

  return displayName
    .charAt(0)
    .toUpperCase()
    .concat(displayName.slice(1))
    .replace(/-([a-z])/, (_, match) => match.toUpperCase())
}

export function createDisplayNameHandler(
  filePath: string
): (documentation: Documentation, path: NodePath) => void {
  return function displayNameHandler(
    documentation: Documentation,
    path: NodePath
  ): void {
    let displayName: ?string = [
      getStaticDisplayName,
      getNodeIdentifier,
      getVariableIdentifier,
    ].reduce((name, getDisplayName) => name || getDisplayName(path), ``)

    if (!displayName) {
      displayName = getNameFromFilePath(filePath)
    }

    documentation.set(`displayName`, displayName || DEFAULT_NAME)
  }
}

export default createDisplayNameHandler(``)

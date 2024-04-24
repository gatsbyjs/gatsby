import path from "node:path";
import { slash } from "gatsby-core-utils";
import mime from "mime";
import isRelative from "is-relative";
import isRelativeUrl from "is-relative-url";
import { getValueAt } from "../../utils/get-value-at";
import { getNode, getNodesByType } from "../../datastore";
import type { IGatsbyNode } from "../../redux/types";

function getFirstValueAt(
  node: IGatsbyNode,
  selector: string | Array<string>,
): string {
  let value = getValueAt(node, selector);
  while (Array.isArray(value)) {
    value = value[0];
  }
  return value;
}

function withBaseDir(dir: string): (p: string) => string {
  return (p: string): string => {
    return path.posix.join(dir, slash(p));
  };
}

function findAncestorNode(
  childNode: IGatsbyNode,
  predicate: (n: IGatsbyNode) => boolean,
): IGatsbyNode | null {
  let node: IGatsbyNode | undefined = childNode;

  do {
    if (predicate(node)) {
      return node;
    }
    node = getNode(node.parent ?? "");
  } while (node !== undefined);

  return null;
}

function getBaseDir(node: IGatsbyNode): string | null {
  if (node) {
    const { dir } = findAncestorNode(
      node,
      (node) => node.internal.type === "File",
    ) || { dir: "" };
    return typeof dir === "string" ? dir : null;
  }

  return null;
}

function getAbsolutePath(
  node: IGatsbyNode,
  relativePath: string | Array<string>,
): string | Array<string> | null {
  const dir = getBaseDir(node);
  const withDir = withBaseDir(dir ?? "");
  return dir
    ? Array.isArray(relativePath)
      ? relativePath.map(withDir)
      : withDir(relativePath)
    : null;
}

function getFilePath(
  fieldPath: string,
  relativePath: string,
): string | Array<string> | null {
  const [typeName, ...selector] = Array.isArray(fieldPath)
    ? fieldPath
    : fieldPath.split(".");

  if (typeName === "File") {
    return null;
  }

  const looksLikeFile =
    !path.isAbsolute(relativePath) &&
    mime.getType(relativePath) !== null &&
    // FIXME: Do we need all of this?
    mime.getType(relativePath) !== "application/x-msdownload" &&
    isRelative(relativePath) &&
    isRelativeUrl(relativePath);

  if (!looksLikeFile) {
    return null;
  }

  const normalizedPath = slash(relativePath);
  // @ts-ignore
  const node = getNodesByType(typeName).find((node: IGatsbyNode): boolean => {
    return getFirstValueAt(node, selector) === normalizedPath;
  });

  return node ? getAbsolutePath(node, normalizedPath) : null;
}

export function isFile(fieldPath: string, relativePath: string): boolean {
  const filePath = getFilePath(fieldPath, relativePath);
  if (!filePath) {
    return false;
  }
  // @ts-ignore
  const filePathExists = getNodesByType("File").some(
    (node: IGatsbyNode): boolean => {
      return node.absolutePath === filePath;
    },
  );
  return filePathExists;
}

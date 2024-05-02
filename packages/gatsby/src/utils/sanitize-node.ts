// eslint-disable-next-line @typescript-eslint/naming-convention
import _ from "lodash";

import type { IGatsbyNode, IGatsbyPage } from "../redux/types";

// export type Data = IGatsbyNode | Array<IGatsbyNode>

type OmitUndefinedNode = (data: IGatsbyNode) => IGatsbyNode;
type OmitUndefinedPage = (data: IGatsbyPage) => IGatsbyPage;
/**
 * @param {Object|Array} data
 * @returns {Object|Array} data without undefined values
 */
const omitUndefinedNode: OmitUndefinedNode = function omitUndefinedNode(
  data: IGatsbyNode,
): IGatsbyNode {
  return _.pickBy(data, Boolean) as IGatsbyNode;
};

/**
 * @param {Object|Array} data
 * @returns {Object|Array} data without undefined values
 */
const omitUndefinedPage: OmitUndefinedPage = function omitUndefinedPage(
  data: IGatsbyPage,
): IGatsbyPage {
  return _.pickBy(data, Boolean) as IGatsbyPage;
};

type isTypeSupported = (data: IGatsbyPage | IGatsbyNode) => boolean;

/**
 * @param {*} data
 * @return {boolean} Boolean if type is supported
 */
const isTypeSupported: isTypeSupported = function isTypeSupported(
  data: unknown,
) {
  if (data === null) {
    return true;
  }

  const type = typeof data;
  const isSupported =
    type === "number" ||
    type === "string" ||
    type === "boolean" ||
    data instanceof Date;

  return isSupported;
};

type sanitizeNode = (
  data: IGatsbyNode,
  isNode?: boolean | undefined,
  path?: Set<IGatsbyNode> | undefined,
) => IGatsbyNode;

type sanitizePage = (
  data: IGatsbyPage,
  isNode?: boolean | undefined,
  path?: Set<IGatsbyPage> | undefined,
) => IGatsbyPage;

/**
 * Make data serializable
 * @param {IGatsbyNode | undefined} data to sanitize
 * @param {boolean | undefined} isNode = true
 * @param {Set<string> | undefined} path = new Set
 */
export const sanitizeNode: sanitizeNode = function sanitizeNode(
  data: IGatsbyNode,
  isNode: boolean | undefined = true,
  path: Set<IGatsbyNode> | undefined = new Set<IGatsbyNode>(),
): IGatsbyNode {
  if (path.has(data)) {
    return data;
  }
  path.add(data);

  const returnData: Partial<IGatsbyNode> = {};

  let anyFieldChanged = false;

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      if (isNode && key === "internal") {
        returnData[key] = data[key];
        continue;
      }

      returnData[key] = sanitizeNode(data[key], false, path);

      if (returnData[key] !== data[key]) {
        anyFieldChanged = true;
      }
    }
  }

  if (anyFieldChanged) {
    data = omitUndefinedNode(returnData as IGatsbyNode);
  }

  // arrays and plain objects are supported - no need to to sanitize
  return data;
};

/**
 * Make data serializable
 * @param {IGatsbyPage | undefined} data to sanitize
 * @param {boolean | undefined} isNode = true
 * @param {Set<string> | undefined} path = new Set
 */
export const sanitizePage: sanitizePage = function sanitizeNode(
  data: IGatsbyPage,
  isNode: boolean | undefined = true,
  path: Set<IGatsbyPage> | undefined = new Set<IGatsbyPage>(),
): IGatsbyPage {
  if (path.has(data)) {
    return data;
  }

  path.add(data);

  const returnData: Partial<IGatsbyPage> = {};

  let anyFieldChanged = false;

  // _.each is a "Collection" method and thus objects with "length" property are iterated as arrays

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      if (isNode && key === "internal") {
        returnData[key] = data[key];
        continue;
      }

      returnData[key] = sanitizeNode(data[key], false, path);

      if (returnData[key] !== data[key]) {
        anyFieldChanged = true;
      }
    }
  }

  if (anyFieldChanged) {
    data = omitUndefinedPage(returnData as IGatsbyPage);
  }

  // arrays and plain objects are supported - no need to to sanitize
  return data;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
import _ from "lodash";
import fs from "fs-extra";
import { print, visit, getLocation } from "graphql";
import { codeFrameColumns } from "@babel/code-frame";
import { distance as levenshtein } from "fastest-levenshtein";
import report from "gatsby-cli/lib/reporter";
import { locInGraphQlToLocInFile } from "./error-parser";
import { getCodeFrame } from "./graphql-errors-codeframe";

type RelayGraphQLError = Error & {
  validationErrors?: Record<string, unknown> | undefined;
};

// These handle specific errors throw by RelayParser. If an error matches
// you get a pointer to the location in the query that is broken, otherwise
// we show the error and the query.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlers: Array<Array<RegExp | (([name]: [string], node: any) => any)>> =
  [
    [
      /Unknown field `(.+)` on type `(.+)`/i,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ([name], node): any => {
        if (node.kind === "Field" && node.name.value === name) {
          return node.name.loc;
        }
        return null;
      },
    ],
    [
      /Unknown argument `(.+)`/i,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ([name], node): any => {
        if (node.kind === "Argument" && node.name.value === name) {
          return node.name.loc;
        }
        return null;
      },
    ],
    [
      /Unknown directive `@(.+)`/i,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ([name], node): any => {
        if (node.kind === "Directive" && node.name.value === name) {
          return node.name.loc;
        }
        return null;
      },
    ],
  ];

function formatFilePath(filePath: string): string {
  return `${report.format.bold("file:")} ${report.format.blue(filePath)}`;
}

function formatError(
  message: string,
  filePath: string,
  codeFrame: string,
): string {
  return (
    report.stripIndent`
    ${message}

      ${formatFilePath(filePath)}
  ` + `\n\n${codeFrame}\n`
  );
}

function extractError(error: Error): {
  message: string;
  docName: string;
  codeBlock: string;
} {
  const docRegex =
    /Error:.(RelayParser|GraphQLParser):(.*)Source: document.`(.*)`.file.*(GraphQL.request.*^\s*$)/gms;
  let matches;
  let message = "";
  let docName = "";
  let codeBlock = "";
  while ((matches = docRegex.exec(error.toString())) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (matches.index === docRegex.lastIndex) docRegex.lastIndex++;
    [, , message, docName, codeBlock] = matches;
  }

  if (!message) {
    message = error.toString();
  }

  message = message.trim();

  return { message, codeBlock, docName };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findLocation(extractedMessage, def): any | null | undefined {
  let location = null;
  visit(def, {
    enter(node) {
      if (location) {
        return;
      }
      for (const [regex, handler] of handlers) {
        const match = extractedMessage.match(regex);
        if (!match) {
          continue;
        }
        if (
          typeof handler === "function" &&
          (location = handler(match.slice(1), node))
        ) {
          break;
        }
      }
    },
  });
  return location;
}

function getCodeFrameFromRelayError(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  def: any,
  extractedMessage: string,
  // error: Error,
): string {
  const { start, source } = findLocation(extractedMessage, def) || {};
  const query = source ? source.body : print(def);

  // we can't reliably get a location without the location source, since
  // the printed query may differ from the original.
  const { line, column } = (source && getLocation(source, start)) || {};
  return getCodeFrame(query, line, column);
}

export function multipleRootQueriesError(
  filePath: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  def: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  otherDef: any,
): {
  id: string;
  filePath: string;
  context: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    otherName: any;
    beforeCodeFrame: string;
    afterCodeFrame: string;
  };
} {
  const name = def.name.value;
  const otherName = otherDef.name.value;
  const field = def.selectionSet.selections[0].name.value;
  const otherField = otherDef.selectionSet.selections[0].name.value;
  const unifiedName = `${_.camelCase(name)}And${_.upperFirst(
    _.camelCase(otherName),
  )}`;

  // colors are problematic for tests as we can different
  // results depending on platform, so we don't
  // highlight code for tests
  const highlightCode = process.env.NODE_ENV !== "test";

  return {
    id: "85910",
    filePath,
    context: {
      name,
      otherName,
      beforeCodeFrame: codeFrameColumns(
        report.stripIndent`
        query ${otherName} {
          ${field} {
            #...
          }
        }

        query ${name} {
          ${otherField} {
            #...
          }
        }
      `,
        {
          start: {
            column: 0,
            line: 0,
          },
        },
        {
          linesBelow: Number.MAX_SAFE_INTEGER,
          highlightCode,
        },
      ),
      afterCodeFrame: codeFrameColumns(
        report.stripIndent`
        query ${unifiedName} {
          ${field} {
            #...
          }
          ${otherField} {
            #...
          }
        }
      `,
        {
          start: {
            column: 0,
            line: 0,
          },
        },
        {
          linesBelow: Number.MAX_SAFE_INTEGER,
          highlightCode,
        },
      ),
    },
  };
}

export function graphqlError(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  definitionsByName: Map<string, any>,
  error: Error | RelayGraphQLError,
): {
  formattedMessage: string;
  docName: string;
  message: string;
  codeBlock: string;
} {
  let codeBlock;
  const { message, docName } = extractError(error);
  const { def, filePath } = definitionsByName.get(docName) || {};

  if (filePath && docName) {
    codeBlock = getCodeFrameFromRelayError(def, message);

    const formattedMessage = formatError(message, filePath, codeBlock);

    return { formattedMessage, docName, message, codeBlock };
  }

  let reportedMessage = `There was an error while compiling your site's GraphQL queries. ${message || error.message}`;

  if (error.message.match(/must be an instance of/)) {
    reportedMessage +=
      "This usually means that more than one instance of 'graphql' is installed " +
      "in your node_modules. Remove all but the top level one or run `npm dedupe` to fix it.";
  }

  if (error.message.match(/Duplicate document/)) {
    reportedMessage += `${error.message.slice(21)}\n`;
  }

  return { formattedMessage: reportedMessage, docName, message, codeBlock };
}

export function unknownFragmentError({
  fragmentNames,
  filePath,
  definition,
  node,
}): {
  id: string;
  filePath: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: { fragmentName: string; closestFragment: any; codeFrame: string };
} {
  const name = node.name.value;
  const closestFragment = fragmentNames
    .map((f) => {
      return { fragment: f, score: levenshtein(name, f) };
    })
    .filter((f) => f.score < 10)
    .sort((a, b) => a.score > b.score)[0]?.fragment;

  let text;
  try {
    text = fs.readFileSync(filePath, { encoding: "utf-8" });
  } catch {
    text = definition.text;
  }

  return {
    id: "85908",
    filePath,
    context: {
      fragmentName: name,
      closestFragment,
      codeFrame: codeFrameColumns(
        text,
        {
          start: locInGraphQlToLocInFile(
            definition.templateLoc,
            getLocation(
              {
                body: definition.text,
                name: "",
                locationOffset: {
                  line: 0,
                  column: 0,
                },
                [Symbol.toStringTag]: "",
              },
              node.loc.start,
            ),
          ),
          end: locInGraphQlToLocInFile(
            definition.templateLoc,
            getLocation(
              {
                body: definition.text,
                name: "",
                locationOffset: {
                  line: 0,
                  column: 0,
                },
                [Symbol.toStringTag]: "",
              },
              node.loc.end,
            ),
          ),
        },
        {
          linesAbove: 10,
          linesBelow: 10,
        },
      ),
    },
  };
}

export function duplicateFragmentError({
  name,
  leftDefinition,
  rightDefinition,
}): {
  id: string;
  context: {
    fragmentName: string;
    leftFragment: { filePath: string; codeFrame: string };
    rightFragment: { filePath: string; codeFrame: string };
  };
} {
  return {
    id: "85919",
    context: {
      fragmentName: name,
      leftFragment: {
        filePath: leftDefinition.filePath,
        codeFrame: codeFrameColumns(
          leftDefinition.text,
          {
            start: getLocation(
              {
                body: leftDefinition.text,
                name: "",
                locationOffset: {
                  line: 0,
                  column: 0,
                },
                [Symbol.toStringTag]: "",
              },
              leftDefinition.def.name.loc.start,
            ),
            end: getLocation(
              {
                body: leftDefinition.text,
                name: "",
                locationOffset: {
                  line: 0,
                  column: 0,
                },
                [Symbol.toStringTag]: "",
              },
              leftDefinition.def.name.loc.end,
            ),
          },
          {
            linesAbove: 10,
            linesBelow: 10,
          },
        ),
      },
      rightFragment: {
        filePath: rightDefinition.filePath,
        codeFrame: codeFrameColumns(
          rightDefinition.text,
          {
            start: getLocation(
              {
                body: rightDefinition.text,
                name: "",
                locationOffset: {
                  line: 0,
                  column: 0,
                },
                [Symbol.toStringTag]: "",
              },
              rightDefinition.def.name.loc.start,
            ),
            end: getLocation(
              {
                body: rightDefinition.text,
                name: "",
                locationOffset: {
                  line: 0,
                  column: 0,
                },
                [Symbol.toStringTag]: "",
              },
              rightDefinition.def.name.loc.end,
            ),
          },
          {
            linesAbove: 10,
            linesBelow: 10,
          },
        ),
      },
    },
  };
}

import {
  type MacroHandler,
  createMacro,
  type MacroParams,
} from "babel-plugin-macros";
import { doSync } from "do-sync";

import { minify, type MinifyOutput } from "terser";

const syncJsMinify = doSync<
  [string, { mangle: { toplevel: boolean } }],
  // @ts-ignore Type 'MinifyOutput' does not satisfy the constraint 'JSONValue'.
  // Type 'MinifyOutput' is not assignable to type 'JSONObject'.
  // Index signature for type 'string' is missing in type 'MinifyOutput'.ts(2344)
  MinifyOutput
>(
  (
    args: [string, { mangle: { toplevel: boolean } }],
  ): Promise<MinifyOutput> => {
    return minify(args[0], args[1] ? args[1] : {});
  },
);

function walkerJs(
  quasiPath:
    | babel.NodePath<babel.types.Node>
    | Array<babel.NodePath<babel.types.Node>>,
): void {
  if (Array.isArray(quasiPath)) {
    quasiPath
      .map(
        (
          path: babel.NodePath<babel.types.Node>,
        ):
          | babel.NodePath<babel.types.Node>
          | Array<babel.NodePath<babel.types.Node>>
          | undefined => {
          return path.parentPath?.get("quasi");
        },
      )
      .forEach(
        (
          value:
            | babel.NodePath<babel.types.Node>
            | Array<babel.NodePath<babel.types.Node>>
            | undefined,
        ): void => {
          if (typeof value === "undefined") {
            return;
          }

          if (Array.isArray(value)) {
            value.forEach((v: babel.NodePath<babel.types.Node>): void => {
              const string: string = v.evaluate().value;

              const result = syncJsMinify(string, {
                mangle: {
                  toplevel: true,
                },
              });

              v.parentPath?.replaceWithSourceString(`\`${result.code}\``);
            });
          } else {
            const string: string = value?.evaluate().value;

            const result = syncJsMinify(string, {
              mangle: {
                toplevel: true,
              },
            });

            value.parentPath?.replaceWithSourceString(`\`${result.code}\``);
          }
        },
      );
  } else {
    const quasiPath2 = quasiPath.parentPath?.get("quasi");

    if (typeof quasiPath2 === "undefined") {
      return;
    }

    if (Array.isArray(quasiPath2)) {
      quasiPath2.forEach((path) => {
        return path.evaluate().value;
      });
    } else {
      const string = quasiPath2?.evaluate().value;

      const result = syncJsMinify(string, {
        mangle: {
          toplevel: true,
        },
      });

      quasiPath2.parentPath?.replaceWithSourceString(`\`${result.code}\``);
    }
  }
}

const _terserMacro: MacroHandler = function _terserMacro({
  references,
}: MacroParams): void {
  references.default.forEach(
    (referencePath: babel.NodePath<babel.types.Node>): void => {
      if (referencePath.parentPath?.type === "TaggedTemplateExpression") {
        const quasiPath = referencePath.parentPath.get("quasi");

        walkerJs(quasiPath);
      }
    },
  );
};

export const terserMacro = createMacro(_terserMacro);

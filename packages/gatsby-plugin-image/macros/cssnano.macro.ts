import {
  type MacroHandler,
  createMacro,
  type MacroParams,
} from "babel-plugin-macros";
import { doSync } from "do-sync";
import litePreset from "cssnano-preset-lite";
import autoprefixer from "autoprefixer";
import postcss from "postcss";
import cssnano from "cssnano";

const preset = litePreset({
  discardComments: {
    remove: (comment) => comment[0] === "@",
  },
});

// @ts-ignore Type 'Result_<Root_>' does not satisfy the constraint 'JSONValue'.
// Type 'Result_<Root_>' is not assignable to type 'JSONObject'.
// Index signature for type 'string' is missing in type 'Result_<Root_>'.ts(2344)
const syncCssMinify = doSync<[code: string], postcss.Result<postcss.Root>>(
  async (code): Promise<postcss.Result<postcss.Root>> => {
    console.log("minifying css");
    console.log(postcss);
    return postcss([
      cssnano({
        preset,
        plugins: [autoprefixer],
      }),
    ]).process(code, { from: undefined, to: undefined });
  },
);

function walkerCss(
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

              const result = syncCssMinify(string);

              v.parentPath?.replaceWithSourceString(`\`${result.css}\``);
            });
          } else {
            const string: string = value?.evaluate().value;

            const result = syncCssMinify(string);

            value.parentPath?.replaceWithSourceString(`\`${result.css}\``);
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

      const result = syncCssMinify(string);

      quasiPath2.parentPath?.replaceWithSourceString(`\`${result.css}\``);
    }
  }
}

const _cssNanoMacro: MacroHandler = function cssNanoMacro({
  references,
}: MacroParams): void {
  references.default.forEach((referencePath) => {
    if (referencePath.parentPath?.type === "TaggedTemplateExpression") {
      walkerCss(referencePath.parentPath.get("quasi"));
    }
  });
};

export const cssNanoMacro = createMacro(_cssNanoMacro);

import React, { type DOMAttributes } from "react";
import { oneLine } from "common-tags";
import type { RenderBodyArgs } from "gatsby";

import {
  type MacroHandler,
  createMacro,
  type MacroParams,
} from "babel-plugin-macros";
import { doSync } from "do-sync";

import { minify, type MinifyOutput } from "terser";
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
    ]).process(code, { from: "", to: "" });
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

const cssNanoMacro = createMacro(_cssNanoMacro);

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

const terserMacro = createMacro(_terserMacro);

function generateHtml(
  str: string,
): DOMAttributes<Element>["dangerouslySetInnerHTML"] {
  return {
    __html: oneLine(str),
  };
}

export function onRenderBody({ setHeadComponents }: RenderBodyArgs): void {
  setHeadComponents([
    <style
      key='gatsby-image-style'
      dangerouslySetInnerHTML={generateHtml(cssNanoMacro.cssNanoMacro`
  .gatsby-image-wrapper {
    position: relative;
    overflow: hidden;
  }
  .gatsby-image-wrapper picture.object-fit-polyfill {
    position: static !important;
  }
  .gatsby-image-wrapper img {
    bottom: 0;
    height: 100%;
    left: 0;
    margin: 0;
    max-width: none;
    padding: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: 100%;
    object-fit: cover;
  }
  .gatsby-image-wrapper [data-main-image] {
    opacity: 0;
    transform: translateZ(0px);
    transition: opacity 250ms linear;
    will-change: opacity;
  }
  .gatsby-image-wrapper-constrained {
    display: inline-block;
    vertical-align: top;
  }
    `)}
    />,
    <noscript
      key='gatsby-image-style-noscript'
      dangerouslySetInnerHTML={generateHtml(
        "<style>" +
          cssNanoMacro.cssNanoMacro`
  .gatsby-image-wrapper noscript [data-main-image] {
    opacity: 1 !important;
  }
  .gatsby-image-wrapper [data-placeholder-image] {
    opacity: 0 !important;
  }
  ` +
          "</style>",
      )}
    />,
    <script
      key='gatsby-image-style-script'
      type='module'
      dangerouslySetInnerHTML={generateHtml(terserMacro`
  const hasNativeLazyLoadSupport = typeof HTMLImageElement !== "undefined" && "loading" in HTMLImageElement.prototype;
  if (hasNativeLazyLoadSupport) {
    document.body.addEventListener('load', function gatsbyImageNativeLoader(e) {
      const target = e.target;

      // if image is not tagged with Main Image we bail
      if (typeof target.dataset["mainImage"] === 'undefined') {
        return
      }

      // if a main image does not have a ssr tag, we know it's not the first run anymore
      if (typeof target.dataset["gatsbyImageSsr"] === 'undefined') {
        return;
      }

      let imageWrapper = null;
      let parentElement = target;
      while (imageWrapper === null && parentElement) {
        if (typeof parentElement.parentNode.dataset["gatsbyImageWrapper"] !== "undefined") {
          imageWrapper = parentElement.parentNode;
        }
        parentElement = parentElement.parentNode;
      }
      const placeholder = imageWrapper.querySelector("[data-placeholder-image]");

      const img = new Image();
      img.src = target.currentSrc;
      // We decode the img through javascript so we're sure the blur-up effect works
      img.decode()
        .catch(() => {
          // do nothing
        })
        .then(() => {
          target.style.opacity = 1;
          if (placeholder) {
            placeholder.style.opacity = 0;
            placeholder.style.transition = "opacity 500ms linear";
          }
        })
    }, true)
  }
    `)}
    />,
  ]);
}

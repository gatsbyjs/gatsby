import React, {
  memo,
  Fragment,
  type JSX,
  type ReactNode,
  type ComponentType,
} from "react";

import type { Layout } from "../image-utils";

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

export type ILayoutWrapperProps = {
  layout: Layout;
  width: number;
  height: number;
};

function _NativeScriptLoading(): JSX.Element {
  return (
    <script
      type='module'
      dangerouslySetInnerHTML={{
        __html: terserMacro`
const hasNativeLazyLoadSupport = typeof HTMLImageElement !== "undefined" && "loading" in HTMLImageElement.prototype;
if (hasNativeLazyLoadSupport) {
  const gatsbyImages = document.querySelectorAll('img[data-main-image]');
  for (let mainImage of gatsbyImages) {
    if (mainImage.dataset.src) {
      mainImage.setAttribute('src', mainImage.dataset.src)
      mainImage.removeAttribute('data-src')
    }
    if (mainImage.dataset.srcset) {
      mainImage.setAttribute('srcset', mainImage.dataset.srcset)
      mainImage.removeAttribute('data-srcset')
    }

    const sources = mainImage.parentNode.querySelectorAll('source[data-srcset]');
    for (let source of sources) {
      source.setAttribute('srcset', source.dataset.srcset)
      source.removeAttribute('data-srcset')
    }

    if (mainImage.complete) {
      mainImage.style.opacity = 1;

      // also hide the placeholder
      mainImage.parentNode.parentNode.querySelector('[data-placeholder-image]').style.opacity = 0;
    }
  }
}
`,
      }}
    />
  );
}

const NativeScriptLoading: ComponentType = memo(_NativeScriptLoading);

export function getSizer(
  layout: Layout | undefined,
  width?: number | undefined,
  height?: number | undefined,
): string {
  let sizer = "";
  if (layout === "fullWidth") {
    sizer = `<div aria-hidden="true" style="padding-top: ${
      ((height ?? 0) / (width ?? 1)) * 100
    }%;"></div>`;
  }

  if (layout === "constrained") {
    sizer = `<div style="max-width: ${width}px; display: block;"><img alt="" role="presentation" aria-hidden="true" src="data:image/svg+xml;charset=utf-8,%3Csvg%20height='${height}'%20width='${width}'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%3E%3C/svg%3E" style="max-width: 100%; display: block; position: static;"></div>`;
  }

  return sizer;
}

function _Sizer({
  layout,
  width,
  height,
}: ILayoutWrapperProps): JSX.Element | null {
  if (layout === "fullWidth") {
    return (
      <div aria-hidden style={{ paddingTop: `${(height / width) * 100}%` }} />
    );
  }

  if (layout === "constrained") {
    return (
      <div style={{ maxWidth: width, display: "block" }}>
        <img
          alt=''
          role='presentation'
          aria-hidden='true'
          src={`data:image/svg+xml;charset=utf-8,%3Csvg%20height='${height}'%20width='${width}'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%3E%3C/svg%3E`}
          style={{
            maxWidth: "100%",
            display: "block",
            position: "static",
          }}
        />
      </div>
    );
  }

  return null;
}

const Sizer: ComponentType<ILayoutWrapperProps> =
  memo<ILayoutWrapperProps>(_Sizer);

function _LayoutWrapper({
  children,
  ...props
}: ILayoutWrapperProps & { children: ReactNode }): JSX.Element {
  return (
    <Fragment>
      <Sizer {...props} />
      {children}

      {SERVER ? <NativeScriptLoading /> : null}
    </Fragment>
  );
}

export const LayoutWrapper: ComponentType<
  ILayoutWrapperProps & { children: ReactNode }
> = memo<ILayoutWrapperProps & { children: ReactNode }>(_LayoutWrapper);

import type { GatsbyBrowser } from "gatsby";
import type { GatsbyImageProps } from "gatsby-plugin-image";
import { createElement } from "react";
import { createRoot } from "react-dom/client";

let hydrateRef: number | NodeJS.Timeout;

export const onRouteUpdate: GatsbyBrowser["onRouteUpdate"] =
  function onRouteUpdate(): void {
    if ("requestIdleCallback" in window) {
      if (typeof hydrateRef === "number") {
        window.cancelIdleCallback(hydrateRef);
      }

      hydrateRef = window.requestIdleCallback(hydrateImages);
    } else {
      if (hydrateRef) {
        clearTimeout(hydrateRef);
      }

      hydrateRef = setTimeout(hydrateImages);
    }
  };

function hydrateImages(): void {
  const doc = document;
  const inlineWPimages: Array<HTMLElement> = Array.from(
    doc.querySelectorAll("[data-wp-inline-image]"),
  );

  if (!inlineWPimages.length) {
    return;
  }

  import(
    /* webpackChunkName: "gatsby-plugin-image" */ "gatsby-plugin-image"
  ).then((mod) => {
    inlineWPimages.forEach((image) => {
      // usually this is the right element to hydrate on
      const grandParentIsGatsbyImage =
        // @ts-ignore Property 'classList' does not exist on type 'ParentNode'.ts(2339)
        image?.parentNode?.parentNode?.classList?.contains(
          "gatsby-image-wrapper",
        );

      // but sometimes this is the right element
      const parentIsGatsbyImage =
        // @ts-ignore Property 'classList' does not exist on type 'ParentNode'.ts(2339)
        image?.parentNode?.classList?.contains("gatsby-image-wrapper");

      if (!grandParentIsGatsbyImage && !parentIsGatsbyImage) {
        return;
      }

      const gatsbyImageHydrationElement = grandParentIsGatsbyImage
        ? image.parentNode.parentNode
        : image.parentNode;

      if (
        image.dataset &&
        image.dataset.wpInlineImage &&
        gatsbyImageHydrationElement
      ) {
        const hydrationData = doc.querySelector(
          `script[data-wp-inline-image-hydration="${image.dataset.wpInlineImage}"]`,
        );

        if (hydrationData) {
          const imageProps: GatsbyImageProps = JSON.parse(
            hydrationData.innerHTML,
          );

          // @ts-ignore Argument of type 'ParentNode' is not assignable to parameter of type 'Container'.
          // Property 'getElementById' is missing in type 'ParentNode' but required in type 'DocumentFragment'.ts(2345)
          const root = createRoot(gatsbyImageHydrationElement);
          root.render(createElement(mod.GatsbyImage, imageProps));
        }
      }
    });
  });
}

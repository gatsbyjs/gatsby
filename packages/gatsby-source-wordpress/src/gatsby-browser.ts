import type { GatsbyBrowser } from "gatsby";
import type { GatsbyImageProps } from "gatsby-plugin-image";
import { createElement } from "react";
// @ts-ignore
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
        // @ts-ignore-next-line classList is on HTMLElement
        image?.parentNode?.parentNode?.classList?.contains(
          "gatsby-image-wrapper",
        );

      // but sometimes this is the right element
      const parentIsGatsbyImage =
        // @ts-ignore-next-line classList is on HTMLElement
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

          // @ts-ignore - TODO: Fix me
          const root = createRoot(gatsbyImageHydrationElement);
          root.render(createElement(mod.GatsbyImage, imageProps));
        }
      }
    });
  });
}

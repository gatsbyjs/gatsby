import React, {
  memo,
  type JSX,
  type ComponentType,
  type ImgHTMLAttributes,
} from "react";
import * as PropTypes from "prop-types";
import { Picture, SourceProps } from "./picture";

export type PlaceholderProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallback?: string | undefined;
  sources?: Array<SourceProps> | undefined;
};

function _Placeholder({ fallback, ...props }: PlaceholderProps): JSX.Element {
  if (fallback) {
    return (
      <Picture
        {...props}
        fallback={{
          src: fallback,
        }}
        aria-hidden
        alt=''
      />
    );
  } else {
    return <div {...props}></div>;
  }
}

export const Placeholder: ComponentType<PlaceholderProps> =
  memo<PlaceholderProps>(_Placeholder);

Placeholder.displayName = "Placeholder";
Placeholder.propTypes = {
  fallback: PropTypes.string,
  sources: Picture.propTypes?.sources,
  alt: function (props, propName, componentName): Error | null {
    if (!props[propName]) {
      return null;
    }

    return new Error(
      `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Validation failed.`,
    );
  },
};

import React, {
  memo,
  type JSX,
  type ComponentType,
  type ImgHTMLAttributes,
} from "react";
import { Picture, type SourceProps } from "./picture";

export type PlaceholderProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallback?: string | undefined;
  sources?: Array<SourceProps> | undefined;
};

function _Placeholder({ fallback, ...props }: PlaceholderProps): JSX.Element {
  if (fallback) {
    return (
      <Picture
        {...props}
        src={props.src ?? ""}
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

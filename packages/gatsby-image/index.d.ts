import * as React from "react";

interface GatsbyImageProps {
  resolutions?: object;
  sizes?: object;
  fixed?: object;
  fluid?: object;
  fadeIn?: boolean;
  title?: string;
  alt?: string;
  className?: string | object;
  critical?: boolean;
  style?: object;
  imgStyle?: object;
  placeholderStyle?: object;
  backgroundColor?: string | boolean;
  onLoad?: (event: any) => void;
  onError?: (event: any) => void;
  Tag?: string;
}

export default class GatsbyImage extends React.Component<GatsbyImageProps, any> {}

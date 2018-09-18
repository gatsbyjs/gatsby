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
  style?: object;
  imgStyle?: object;
  backgroundColor?: string | boolean;
  onLoad?: (event: any) => void;
  Tag?: string;
}

export default class GatsbyImage extends React.Component<GatsbyImageProps, any> {}

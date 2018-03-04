import * as React from "react";

interface GatsbyImageProps {
  responsiveResolution?: object;
  responsiveSizes?: object;
  resolutions?: object;
  sizes?: object;
  fadeIn?: boolean;
  title?: string;
  alt?: string;
  className?: string | object;
  outerWrapperClassName?: string | object;
  style?: object;
  imgStyle?: object;
  position?: string;
  backgroundColor?: string | boolean;
  onLoad?: (event: any) => void;
  Tag?: string;
}

export default class GatsbyImage extends React.Component<GatsbyImageProps, any> {}

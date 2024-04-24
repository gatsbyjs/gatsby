import {
  GatsbyImage as GatsbyImageBrowser,
  type IGatsbyImageData,
} from "./gatsby-image.browser";

import {
  _getStaticImage,
  propTypes,
  type IStaticImageProps,
} from "./static-image.server";
// These values are added by Babel. Do not add them manually
type IPrivateProps = {
  __imageData?: IGatsbyImageData | undefined;
  __error?: string | undefined;
};

export const StaticImage: React.FC<IStaticImageProps & IPrivateProps> =
  _getStaticImage(GatsbyImageBrowser);

StaticImage.displayName = "StaticImage";
StaticImage.propTypes = propTypes;

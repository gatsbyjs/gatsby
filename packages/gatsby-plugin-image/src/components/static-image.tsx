import {
  GatsbyImage as GatsbyImageBrowser,
  type IGatsbyImageData,
} from "./gatsby-image.browser";

import { _getStaticImage, type IStaticImageProps } from "./static-image.server";
// These values are added by Babel. Do not add them manually
type IPrivateProps = {
  __imageData?: IGatsbyImageData | undefined;
  __error?: string | undefined;
};

export const StaticImage: React.FC<IStaticImageProps & IPrivateProps> | null =
  _getStaticImage(GatsbyImageBrowser);

if (StaticImage !== null) {
  StaticImage.displayName = "StaticImage";
}

const path = require('path');

const {
  queueImageResizing,
  base64,
  responsiveSizes,
  responsiveResolution
} = require('../');

describe('gatsby-plugin-sharp', () => {
  const args = {
    duotone: false,
    grayscale: false,
    rotate: false,
  };
  const absolutePath = path.resolve('./www/src/argyle.png');
  const file = {
    id: `${absolutePath} absPath of file`,
    absolutePath,
    extension: 'png',
    internal: {
      contentDigest: '1234'
    }
  };

  describe('responsiveSizes', () => {
    it('includes responsive image properties, e.g. sizes, srcset, etc.', async () => {
      const result = await responsiveSizes({ file });

      expect(result).toMatchSnapshot();
    });

    it('adds pathPrefix if defined', async () => {
      const pathPrefix = '/blog';
      const result = await responsiveSizes({
        file,
        args: {
          pathPrefix
        }
      });

      expect(result.src.indexOf(pathPrefix)).toBe(0);
      expect(result.srcSet.indexOf(pathPrefix)).toBe(0);
    });
  });

  describe('base64', () => {
    it('converts image to base64', async () => {
      const result = await base64({
        file,
        args
      });

      expect(result).toMatchSnapshot();
    });
  });
});

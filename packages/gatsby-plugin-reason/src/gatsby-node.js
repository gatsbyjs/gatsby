`use strict`;

import { process } from 'bs-loader';

export const resolvableExtensions = () => [`.re`, `.ml`];

export const modifyWebpackConfig = ({ config }) => {
  config.loader(`reason`, {
    test: /\.(re|ml)$/,
    loader: `bs-loader`
  });
};

export const preprocessSource = ({ contents, filename }) => {
  return test.test(filename) ? process(contents, filename) : null;
};

import React from 'react';

const getInstance = (to, pathPrefix = '') => {
  if (pathPrefix) {
    global.__PREFIX_PATHS__ = true;
    global.__PATH_PREFIX__ = pathPrefix;
  } else {
    global.__PREFIX_PATHS__ = false;
  }
  const Link = require('../').default;
  return new Link({
    to
  });
};

test('it does not prefix paths by default', () => {
  const instance = getInstance('/some-path');

  expect(instance.state.to).toBe('/some-path');
});

test.skip('it prefixes paths if __PREFIX_PATHS__ and __PATH_PREFIX__ are defined', () => {
  const instance = getInstance('/some-path', '/blog');

  expect(instance.state.to).toBe('/blog/some-path');
});

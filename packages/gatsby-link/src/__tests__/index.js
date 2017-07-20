import React from 'react';

const getInstance = (props, pathPrefix = '') => {
  Object.assign(global.window, {
    __PREFIX_PATHS__: pathPrefix ? true : false,
    __PATH_PREFIX__: pathPrefix  
  });

  const Link = require('../index').default;
  return new Link(props);
};

describe('<Link />', () => {
  describe('path prefixing', () => {
    it('does not include path prefix by default', () => {
      const to = '/path';
      const instance = getInstance({
        to
      });

      expect(instance.state.to).toEqual(to);
    });

    /*
     * Running _both_ of these tests causes the globals to be cached or something
     */
    it.skip('will use __PATH_PREFIX__ if __PREFIX_PATHS__ defined', () => {
      const to = '/path';
      const pathPrefix = '/blog';

      const instance = getInstance({
        to
      }, pathPrefix);

      expect(instance.state.to).toEqual(`${pathPrefix}${to}`);
    });
  });
});

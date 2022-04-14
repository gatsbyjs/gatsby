import {Resolver} from '@parcel/plugin';
import path from 'path';

export default new Resolver({
  async resolve({specifier}) {
    console.log(specifier)
    
    if (specifier === 'special-module') {
      return {
        filePath: path.join(__dirname, 'special-module.js')
      };
    }

    return null;
  }
});
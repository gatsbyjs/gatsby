import {Resolver} from '@parcel/plugin';
// import path from 'path';
// import {fileURLToPath, pathToFileURL} from 'url';

export default new Resolver({
  async resolve(args) {
    if (args.specifier.indexOf("routes") >= 0)
      console.log(args)
    // if (specifier === 'aws-sdk') {
    //   return {isExcluded: true};
    // }

    return null;
  }
});
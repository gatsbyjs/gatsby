/*
 * HashedChunkIdsPlugin
 * source https://github.com/webpack/webpack/blob/376badba98d5323bfb342e8b2c438fc3dcc4954b/lib/NamedChunksPlugin.js
 */

const getHashFn = require(`./get-hash-fn`)

function HashedChunkIdsPlugin(options) {
    this.options = options || {}
}

HashedChunkIdsPlugin.prototype.apply = function apply(compiler) {
    const hashFn = getHashFn(this.options)
    compiler.plugin(`compilation`, compilation => {
        compilation.plugin(`before-chunk-ids`, chunks => {
            chunks.forEach(chunk => {
                if (chunk.id === null) {
                    chunk.id = hashFn(chunk.name)
                }
            });
        });
    });
};

module.exports = HashedChunkIdsPlugin

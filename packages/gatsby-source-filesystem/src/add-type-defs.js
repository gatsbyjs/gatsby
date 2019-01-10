// TODO: What is actually needed?
module.exports = ({ addTypeDefs }) => {
  const typeDefs = `
    absolutePath: String
    accessTime: Date
    atime: Date
    atimeMs: Float
    base: String
    birthtime: Date
    birthTime: Date
    birthtimeMs: Float
    # blksize: Int (Linux: yes, Windows: no, Mac: ???)
    # blocks: Int (Linux: yes, Windows: no, Mac: ???)
    changeTime: Date
    ctime: Date
    ctimeMs: Float
    dev: Int
    dir: String
    ext: String
    extension: String
    gid: Int
    ino: Int
    mode: Int
    modifiedTime: Date
    mtime: Date
    mtimeMs: Float
    name: String
    nlink: Int
    prettySize: String
    rdev: Int
    relativeDirectory: String
    relativePath: String
    root: String
    size: Int
    sourceInstanceName: String
    uid: Int
  `
  addTypeDefs(typeDefs)
}

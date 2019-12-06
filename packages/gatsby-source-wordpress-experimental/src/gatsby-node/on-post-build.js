import setImageNodeIdCache from "./set-image-node-id-cache"

const onPostBuild = async () => {
  await setImageNodeIdCache()
}

export default onPostBuild

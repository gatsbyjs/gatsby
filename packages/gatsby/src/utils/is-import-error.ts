// This module is also copied into the .cache directory some modules copied there
// from cache-dir can also use this module.
export const isImportError = (err: any): boolean => {
  // PnP will return the following code when a require is allowed per the
  // dependency tree rules but the requested file doesn't exist
  // TODO: confirm if this is the same error code we get in PnP when a module isn't found

  if (
    err.code === `QUALIFIED_PATH_RESOLUTION_FAILED` ||
    err.pnpCode === `QUALIFIED_PATH_RESOLUTION_FAILED`
  ) {
    return true
  }
  return err
    .toString()
    .includes(`Error [ERR_MODULE_NOT_FOUND]: Cannot find package`)
}

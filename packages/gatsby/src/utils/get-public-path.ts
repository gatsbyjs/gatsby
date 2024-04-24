function trimSlashes(part: string): string {
  return part.replace(/(^\/)|(\/$)/g, "");
}

function isURL(possibleUrl: string): boolean {
  return ["http://", "https://", "//"].some((expr) =>
    possibleUrl.startsWith(expr),
  );
}

export function getPublicPath({
  assetPrefix,
  pathPrefix,
  prefixPaths,
}: {
  assetPrefix?: string | undefined;
  pathPrefix?: string | undefined;
  prefixPaths?: boolean | undefined;
}): string {
  if (prefixPaths && (assetPrefix || pathPrefix)) {
    const normalized = [assetPrefix, pathPrefix]
      .filter((part): part is string => (part ? part.length > 0 : false))
      .map((part) => trimSlashes(part))
      .join("/");

    return isURL(normalized) ? normalized : `/${normalized}`;
  }

  return "";
}

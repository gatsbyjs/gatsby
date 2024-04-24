// path ranking algorithm copied (with small adjustments) from `@reach/router` (internal util, not exported from the package)
// https://github.com/reach/router/blob/28a79e7fc3a3487cb3304210dc3501efb8a50eba/src/lib/utils.js#L216-L254
const paramRe = /^:(.+)/;

const SEGMENT_POINTS = 4;
const STATIC_POINTS = 3;
const DYNAMIC_POINTS = 2;
const SPLAT_PENALTY = 1;
const ROOT_POINTS = 1;

function isRootSegment(segment: string): boolean {
  return segment === "";
}
function isDynamic(segment: string): boolean {
  return paramRe.test(segment);
}
function isSplat(segment: string): boolean {
  return segment === "*";
}

function segmentize(uri: string | null): Array<string> | undefined {
  return (
    uri
      // strip starting/ending slashes
      ?.replace(/(^\/+|\/+$)/g, "")
      .split("/")
  );
}

export function rankRoute(path: string | null): number | undefined {
  return segmentize(path)?.reduce((score: number, segment: string) => {
    score += SEGMENT_POINTS;
    if (isRootSegment(segment)) score += ROOT_POINTS;
    else if (isDynamic(segment)) score += DYNAMIC_POINTS;
    else if (isSplat(segment)) score -= SEGMENT_POINTS + SPLAT_PENALTY;
    else score += STATIC_POINTS;
    return score;
  }, 0);
}
// end of copied `@reach/router` internals
